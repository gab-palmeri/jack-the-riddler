'use strict';

const sqlite = require('sqlite3');
const crypto = require ('crypto');

//Database connection
const db = new sqlite.Database('./daos/db.sqlite',
(err) => { if (err) throw err; });


//authenticate user by email
exports.authenticateUser = (email, password) => {

	return new Promise((resolve, reject) => {

		const sql = 'SELECT * FROM user WHERE email = ?';

		db.get(sql, [email], (err, row) => {

			
			if (err) { reject(err); }

			else if (row === undefined) { resolve(false); }

			else {
				const user = {id: row.id, email: row.email, name: row.name, surname: row.surname, score: row.score};
				const salt = row.salt;
				crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
					if (err) reject(err);

					if(!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword))
						resolve(false);
					else resolve(user);
				});
			}
		});
	});
}


exports.getUserById = (id) => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT id, name, surname, email, score FROM user WHERE id = ?';
		db.get(sql, [id], (err, user) => {
			if (err) {
				reject(err);
			} else {
				if (user) {
					resolve(user);
				} else {
					reject(null);
				}
			}
		});
	});
}


//METODO PER AVERE UNA LISTA DEI PROPRI RIDDLES
exports.getUserRiddles = (userId) => {

	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM riddle WHERE user_id = ?';
		db.all(sql, [userId], (err, rows) => {
			if (err) {
				reject(err);
			} else {
				if (rows) {
					const riddles = rows.map((riddle) => ({ id: riddle.id, question: riddle.question, difficulty: riddle.difficulty, state: riddle.state}));
					resolve(riddles);
				} else {
					reject(null);
				}
			}
		});
	});
}


//METODO PER AVERE IL DETTAGLIO DI UN PROPRIO RIDDLE
exports.getUserRiddleById = (userId, riddleId) => {

	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM riddle WHERE id = ? AND user_id = ?';
		db.get(sql, [riddleId, userId], (err, riddle) => {
		if (err) {
			reject(err);

		} else {
			if(riddle) {

				//get all answers to the riddle from riddle_user, with joined user data
				const query = 'SELECT * FROM riddle_user ru INNER JOIN user u ON ru.user_id = u.id WHERE ru.riddle_id = ?';
				db.all(query, [riddleId], (err, rows) => {
					if (err) {
						reject(err);
					} else {

						//The winner will be none if the riddle is open, or if it's closed and no one has given the right answer
						const winner = rows.find((row) => row.answer === riddle.answer);

						const formattedRiddle = { 
							id: riddle.id, 
							question: riddle.question, 
							answer: riddle.answer, 
							difficulty: riddle.difficulty, 
							duration: riddle.duration, 
							first_tip: riddle.first_tip, 
							second_tip: riddle.second_tip, 
							state: riddle.state, 
							expiry_date: riddle.expiry_date,
							author: {
								name: riddle.name,
								surname: riddle.surname
							},
							answers: rows.map((row) => ({
								name: row.name,
								surname: row.surname,
								answer: row.answer
							})),
							winner: winner == null ? null :{
								name: winner.name,
								surname: winner.surname
							}
						};

						resolve(formattedRiddle);
					}

				});
			}
			else {
				reject(`Riddle with id ${riddleId} not found.`);
			}
		}
	});
  });
}

//get users with the best 3 scores: if there is a tie, show them both
exports.getBestUsers = () => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT name, surname, score FROM user WHERE score IN (SELECT DISTINCT score FROM user ORDER BY score DESC LIMIT 3)';
		db.all(sql, (err, users) => {
			if (err) {
				reject(err);
			} else {
				if (users) {
					//order users before sending them
					const orderedUsers = users.sort((a, b) => b.score - a.score);
					resolve(orderedUsers);
				} else {
					reject(null);
				}
			}
		});
	});
}

exports.getCountdownAndAnswers = (userId, riddleId) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT state, expiry_date, riddle_user.answer, user.name, user.surname
					FROM riddle 
					LEFT JOIN riddle_user
					ON riddle.id = riddle_user.riddle_id
					LEFT JOIN user
					ON riddle_user.user_id = user.id
					WHERE riddle.id = ? AND riddle.user_id = ?`;
		db.all(sql, [riddleId, userId], (err, rows) => {
			if (err) {
				reject(err);
			} else {
				if(rows && rows.length > 0) {

					//create a single riddle object containing state, expiry date and all answers
					const riddle = {
						state: rows[0].state,
						expiry_date: rows[0].expiry_date,
						answers: rows.map((row) => {
							return {
								name: row.name,
								surname: row.surname,
								answer: row.answer
							}
						})
					}


					//if the expiration date is equal to 0, it means we dont have a countdown yet
					if(riddle.expiry_date === 0) {
						resolve({seconds: -2});
					}
					else {
						
						if(riddle.state == 0) {
							module.exports.getUserRiddleById(userId, riddleId).then((riddle) => {
								resolve({seconds: -1, riddle:riddle});
							}).catch((err) => {
								reject(err);
							});
						}
						else {
							const seconds = Math.floor((new Date(riddle.expiry_date) - Date.now()) / 1000);

							//IF THE RIDDLE IS EXPIRED, CLOSE IT
							if(seconds < 0) {
								const sql = 'UPDATE riddle SET state = 0 WHERE id = ?';
								db.run(sql, [riddleId], (err) => {
									if (err) {
										reject(err);
									} else {

										module.exports.getUserRiddleById(userId, riddleId).then((riddle) => {
											resolve({seconds: -1, riddle:riddle});
										}).catch((err) => {
											reject(err);
										});
									}
								});
							}
							else {
								resolve({seconds: seconds, answers: riddle.answers});
							}
						}
					}
				}
				else {
					reject(`Riddle with id ${riddleId} not found.`);
				}
			}
		});
	});
}


//this is basically the same as the getRiddlesState in the riddle DAO, but this time we take *only* the riddles belonging to the logged user
exports.getUserRiddlesState = (userId) => {
	return new Promise((resolve, reject) => {

		//We exclude the riddles that the user created, since they are now shown in the main riddles page
		const sql = 'SELECT id, state, expiry_date FROM riddle WHERE user_id == ?';
		db.all(sql, [userId], (err, rows) => {
			if (err) {
				reject(err);
			} else {
				if(rows) {
					
					//for each riddle, if the expiry_date is a previous date, update the state to 0
					//this part of the code handles the following scenario: the riddle countdown has expired, 
					//but no one was on its detail page when that happened.
					rows.forEach((row) => {
						if(row.expiry_date !== 0 && new Date(row.expiry_date) < Date.now()) {
							const sql = 'UPDATE riddle SET state = 0 WHERE id = ?';
							db.run(sql, [row.id], (err) => {
								if (err) {
									reject(err);
								}
							});
						}
					});

					resolve(rows);
				}
				else {
					reject(`Error during the retrieval of the riddles.`);
				}
			}
		});
	});
}

exports.getUserScore = (userId) => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT score FROM user WHERE id = ?';
		db.get(sql, [userId], (err, row) => {
			if (err) {
				reject(err);
			} else {
				if(row) {
					resolve(row);
				}
				else {	
					reject(`User with id ${userId} not found.`);
				}
			}
		});
	});
}