"use strict";

const { check, validationResult } = require('express-validator');

const riddleDao = require('../daos/riddleDao');
const RiddleService = require('../services/RiddleService');
const rsInstance = new RiddleService(riddleDao);

const isLoggedIn = require('../middlewares/isLoggedIn').isLoggedIn;

class RiddleRouter {

	#app;
	#router;

	constructor() {
		this.#app = require('express');
		this.#router = this.#app.Router();
		this.setRoutes();
	}

	setRoutes() {

		this.#router.get('/', (req, res) => {

			rsInstance.getRiddles(req.user == undefined ? -1 : req.user.id)
				.then((riddles) => res.status(200).json(riddles))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of riddles.` }));
		});

		this.#router.get('/preview', (req, res) => {
			rsInstance.getRiddlesPreview()
				.then((riddles) => res.status(200).json(riddles))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of riddles.` }));
		});

		this.#router.get('/state', isLoggedIn, (req, res) => {
			rsInstance.getRiddlesState(req.user.id)
				.then((riddlesState) => res.status(200).json(riddlesState))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of riddles.` }));
		});

		this.#router.get('/:id', isLoggedIn, (req, res) => {
			rsInstance.getRiddleById(req.params.id, req.user.id)
				.then((riddle) => res.status(200).json(riddle))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of riddles.` }));
		});

		this.#router.get('/:id/countdown', isLoggedIn, (req, res) => {
			rsInstance.getCountdown(req.params.id, req.user.id)
				.then((expiryDate) => res.status(200).json(expiryDate))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of riddles.` }));
		});

		this.#router.get('/:id/first_tip', isLoggedIn, (req, res) => {
			rsInstance.getFirstTip(req.params.id)
				.then((firstTip) => res.status(200).json(firstTip))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of riddles.` }));
		});

		this.#router.get('/:id/second_tip', isLoggedIn, (req, res) => {
			rsInstance.getSecondTip(req.params.id)
				.then((secondTip) => res.status(200).json(secondTip))
				.catch(() => res.status(503).json({ error: `Database error during the retrieval of riddles.` }));
		});

		//Create new riddle
		this.#router.post('/', isLoggedIn, [
			
			check('question').isLength({ min: 1 }).withMessage('Question is required'),
			check('answer').isLength({ min: 1 }).withMessage('Answer is required'),
			check('difficulty').isInt({ min: 1, max: 3 }).withMessage('Difficulty is required'),
			check('duration').isInt({ min: 30, max: 600 }).withMessage('Duration is required'),
			check('firstTip').isLength({ min: 1 }).withMessage('First tip is required'),
			check('secondTip').isLength({ min: 1 }).withMessage('Second tip is required'),
			
		], (req, res) => {
			
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array().map(error => error.msg) });
			}
			
			const riddle = {
				question: req.body.question,
				answer: req.body.answer,
				difficulty: req.body.difficulty,
				duration: req.body.duration,
				firstTip: req.body.firstTip,
				secondTip: req.body.secondTip,
				state: 1,
			};
			
			rsInstance.createRiddle(req.user.id, riddle)
				.then(() => res.status(201).end())
				.catch(() => res.status(503).json({ error: `Database error during the creation of riddle ${riddle.question}.` }));
			
		});

		//answer riddle
		this.#router.post('/:id', isLoggedIn, [
			check('answer').isLength({ min: 1 }).withMessage('Answer is required'),
		], (req, res) => {

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array().map(error => error.msg) });
			}

			rsInstance.answerRiddle(req.params.id, req.body.answer, req.user.id)
				.then((response) => res.status(201).json(response))
				.catch(() => res.status(503).json({ error: `Database error during the insertion of the answer.` }));
		});
	}

	getRouter() {
		return this.#router;
	}

}

module.exports = RiddleRouter;