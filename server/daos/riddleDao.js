'use strict';

const sqlite = require('sqlite3');
const crypto = require ('crypto');

//Database connection
const db = new sqlite.Database('./daos/db.sqlite',
    (err) => { if (err) throw err; });


//FUNCTIONS THAT GET ENTIRE RIDDLES
exports.getRiddles = (userId) => {
	
	return new Promise((resolve, reject) => {

		const sql = 'SELECT riddle.id, riddle.question, riddle.difficulty, riddle.state, user.name, user.surname FROM riddle JOIN user ON riddle.user_id = user.id WHERE user_id != ?';
		db.all(sql, [userId], (err, rows) => {
		if (err) {

			reject(err);

		} else {
			const riddles = rows.map((riddle) => ({ 
				id: riddle.id, 
				question: riddle.question, 
				difficulty: riddle.difficulty, 
				state: riddle.state, 
				//expiry_date: riddle.expiry_date, RIMETTERE SE SERVE
				author: {
					name: riddle.name,
					surname: riddle.surname
				}
			}));
      		resolve(riddles);
		}
		});
  });
}

exports.getRiddlesPreview = () => {
	return new Promise((resolve, reject) => {

		//get 6 random riddles
		const sql = 'SELECT riddle.id, riddle.question, riddle.difficulty, riddle.state, riddle.expiry_date, user.name, user.surname FROM riddle JOIN user ON riddle.user_id = user.id ORDER BY RANDOM() LIMIT 6';

		db.all(sql, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				if(rows) {
					const riddles = rows.map((riddle) => ({ 
						id: riddle.id, 
						question: riddle.question, 
						difficulty: riddle.difficulty, 
						state: riddle.state, 
						expiry_date: riddle.expiry_date,
						author: {
							name: riddle.name,
							surname: riddle.surname
						}
					}));
      				resolve(riddles);
				}
				else {
					reject(`Riddle with id ${id} not found.`);
				}
			}
		});
	});
}

exports.getRiddleById = (id, userId) => {

	return new Promise((resolve, reject) => {
		const sql = `SELECT riddle.id, riddle.question, riddle.answer, riddle.difficulty, riddle.duration, riddle.first_tip, 
					riddle.second_tip, riddle.state, riddle.expiry_date, user.name, user.surname, riddle_user.answer as user_answer
					FROM riddle 
					JOIN user ON riddle.user_id = user.id 
					LEFT JOIN riddle_user ON riddle_user.riddle_id = riddle.id AND riddle_user.user_id = ?
					WHERE riddle.id = ? AND riddle.user_id != ?`;


		db.get(sql, [userId, id, userId], (err, riddle) => {
			if (err) {

				reject(err);

			} else {
				if(riddle) {

					if(riddle.state === 1) {

						//The riddle is open
						const formattedRiddle = { 
							id: riddle.id, 
							question: riddle.question, 
							difficulty: riddle.difficulty, 
							duration: riddle.duration, 
							state: riddle.state, 
							expiry_date: riddle.expiry_date,
							author: {
								name: riddle.name,
								surname: riddle.surname
							},
							user_answer: riddle.user_answer,
						};

						resolve(formattedRiddle);

					}
					else {

						//get all answers to the riddle from riddle_user, with joined user data
						const query = 'SELECT * FROM riddle_user ru INNER JOIN user u ON ru.user_id = u.id WHERE ru.riddle_id = ?';
						db.all(query, [id], (err, rows) => {
							if (err) {
								reject(err);
							} else {
								

								//search for the winner
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
				}
				else {
					reject(`Riddle with id ${id} not found.`);
				}
			}
		});
	});
}
//***************************************************************************** */

//FUNCTIONS THAT CREATE SOMETHING
exports.createRiddle = (userId, riddle) => {
  return new Promise((resolve, reject) => {

    const sql = 'INSERT INTO riddle(question, answer, difficulty, duration, first_tip, second_tip, state, user_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';

	db.run(sql, [riddle.question, riddle.answer, riddle.difficulty, riddle.duration, riddle.firstTip, riddle.secondTip, riddle.state, userId], (err) => {
		if (err) {
			reject(err);
		} else {
			resolve();
		}
	});
  });
};

exports.answerRiddle = (id, answer, userId) => {

	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM riddle WHERE id = ? AND state = 1';
		db.get(sql, [id], (err, riddle) => {
			if (err) {
				reject(err);
			} else {

				if(riddle) {
					//these checks are done after the query to better customize the error messages, thus having a richer user experience
					if(riddle.expiry_date.length === 0 && new Date(riddle.expiry_date) < Date.now()) {
						reject('The riddle countdown has expired.');
						return;
					}
						
					
					if(riddle.user_id == userId) {
						reject("You can't answer your own riddle");
						return;
					}
						
					
					//check that the user has not already answered the riddle
					const sql = 'SELECT * FROM riddle_user WHERE riddle_id = ? AND user_id = ?';
					db.get(sql, [id, userId], (err, row) => {
						if (err) {
							reject(err);
						} else {
							if(row) {
								reject('You have already answered this riddle.');
							}
							else {
								//add the answer to the table riddle_user which links riddle and user
								const sql = 'INSERT INTO riddle_user(riddle_id, user_id, answer) VALUES(?, ?, ?)';
								db.run(sql, [id, userId, answer], (err) => {
									if (err) {
										reject(err);
									} else {

										//if the answer was correct, close the riddle
										if(riddle.answer === answer) {
											const sql = 'UPDATE riddle SET state = 0 WHERE id = ?';
											db.run(sql, [id], (err) => {
												if (err) {
													reject(err);
												} else {

													//increase the score of the user by a number equal to the riddle difficulty
													const sql = 'UPDATE user SET score = score + ? WHERE id = ?';
													db.run(sql, [riddle.difficulty, userId], (err) => {
														if (err) {
															reject(err);
														} else {

															module.exports.getRiddleById(id, userId).then((riddle) => {
																resolve({correct_answer: true, riddle:riddle});
															}).catch((err) => {
																reject(err);
															});	
														}
													});
												}
											});
										}
										else {

											//set the riddle expiry date to now + the riddle duration which is in minutes, if the expiry date is null
											if(riddle.expiry_date === 0) {

												//set the riddle expiry date to now + the riddle duration
												const sql = 'UPDATE riddle SET expiry_date = ? WHERE id = ?';
												db.run(sql, [Date.now() + riddle.duration * 1000, id], (err) => {
													if (err) {
														reject(err);
													} else {
														resolve({correct_answer: false});
													}
												});
											}
											else {
												resolve({correct_answer: false});
											}
										}

										
									}
								});

							}
						}
					});
					
				}
				else {
					reject(`Riddle with id ${id} not found.`);
				}
			}
		});
	});

}
//***************************************************************************** */


//METHODS THAT GET PARTIAL DATA OF RIDDLES
exports.getFirstTip = (id) => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT first_tip FROM riddle WHERE id = ?';
		db.get(sql, [id], (err, row) => {
			if (err) {
				reject(err);
			} else {
				if(row) {
					resolve(row.first_tip);
				}
				else {
					reject(`Riddle with id ${id} not found.`);
				}
			}
		});
	});
}


exports.getSecondTip = (id) => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT second_tip FROM riddle WHERE id = ?';
		db.get(sql, [id], (err, row) => {
			if (err) {
				reject(err);
			} else {
				if(row) {
					resolve(row.second_tip);
				}
				else {
					reject(`Riddle with id ${id} not found.`);
				}
			}
		});
	});
}

exports.getCountdown = (id, userId) => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT state, expiry_date FROM riddle WHERE id = ?';
		db.get(sql, [id], (err, row) => {
			if (err) {
				reject(err);
			} else {
				if(row) {
					if(row.expiry_date === 0) {
						resolve({seconds: -2});
					}
					else {				
						
						//if someone else has completed the riddle
						if(row.state == 0) {
							module.exports.getRiddleById(id, userId).then((riddle) => {
								resolve({seconds: -1, riddle:riddle});
							}).catch((err) => {
								reject(err);
							});
						}
						else {
							const seconds = Math.floor((new Date(row.expiry_date) - Date.now()) / 1000);

							//IF THE RIDDLE IS EXPIRED, CLOSE IT
							if(seconds < 0) {

								const sql = 'UPDATE riddle SET state = 0 WHERE id = ?';
								db.run(sql, [id], (err) => {
									if (err) {
										reject(err);
									} else {
										resolve({seconds: -1});
									}
								});
							}
							else {
								resolve({seconds: seconds});
							}
						}
						
					}
				}
				else {
					reject(`Riddle with id ${id} not found.`);
				}
			}
		});
	});
}

exports.getRiddlesState = (userId) => {
	return new Promise((resolve, reject) => {

		//We exclude the riddles that the user created, since they are now shown in the main riddles page
		const sql = 'SELECT id, state, expiry_date FROM riddle WHERE user_id != ?';
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
					reject(`Riddle with id ${id} not found.`);
				}
			}
		});
	});
}


//***************************************************************************** */
