"use strict";

const passport = require("passport");
const userDao = require('../daos/userDao');
const UserService = require('../services/UserService');
const usInstance = new UserService(userDao);

const isLoggedIn = require('../middlewares/isLoggedIn').isLoggedIn;

class UserRouter {

	#app;
	#router;

	constructor() {
		this.#app = require('express');
		this.#router = this.#app.Router();
		this.setRoutes();
	}

	setRoutes() {

		//in these routes, if we have an error we return a "static" error message.
		//this choice was done because the errors that the DAO generates are very specific
		//so the average user will not understand what is happening.
		//In a more advanced application, we could put the DAO errors in an appropriate LOG file

		this.#router.post('/login', function(req, res, next) {
  			passport.authenticate('local', (err, user, info) => {
    			if (err)
      				return next(err);
      			if (!user) {
					//if the user was not found, return an error message
					return res.status(401).json(info);
      			}
				
				//else, do the login
				req.login(user, (err) => {
        			if (err)
          				return next(err);
        
        			//send the user info back to the client
        			return res.status(200).json(req.user);
				});
			})(req, res, next);
		});

		this.#router.delete('/logout', (req, res) => {
  			req.logout( ()=> { res.end(); } );
		});

		this.#router.get('/', isLoggedIn, (req, res) => {
			res.status(200).json(req.user);
		});

		this.#router.get('/score', isLoggedIn, (req, res) => {
			usInstance.getUserScore(req.user.id).then(score => {
				res.status(200).json(score);
			}).catch(err => {
				res.status(500).json(err);
			});
		});

		//get best users
		this.#router.get('/best', (req, res) => {
			usInstance.getBestUsers()
				.then((users) => res.status(200).json(users))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval the best users.` }));
		});

		this.#router.get('/riddle', isLoggedIn, (req, res) => {
			usInstance.getUserRiddles(req.user.id)
				.then((riddles) => res.status(200).json(riddles))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of user riddles.` }));
		});

		this.#router.get('/riddle/state', isLoggedIn, (req, res) => {
			usInstance.getUserRiddlesState(req.user.id)
				.then((state) => res.status(200).json(state))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of user riddles' states.` }));
		});

		this.#router.get('/riddle/:id', isLoggedIn, (req, res) => {
			usInstance.getUserRiddleById(req.user == null ? null : req.user.id, req.params.id)
				.then((riddle) => res.status(200).json(riddle))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of user riddle ${req.params.id}.` }));
		});

		this.#router.get('/riddle/:id/countdown_answers', isLoggedIn, (req, res) => {
			usInstance.getCountdownAndAnswers(req.user.id, req.params.id)
				.then((countdownAndAnswers) => res.status(200).json(countdownAndAnswers))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of user riddle's countdown and answers.` }));
		});

	}

	getRouter() {
		return this.#router;
	}

}

module.exports = UserRouter;