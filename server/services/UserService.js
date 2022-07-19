"use strict";

class UserService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

	getUserById(userId) {
		return this.#dao.getUserById(userId);
	}

	authenticateUser(email, password) {
		return this.#dao.authenticateUser(email, password);
	}
	
	getBestUsers() {
		return this.#dao.getBestUsers();
	}

	getUserRiddles(userId) {
		return this.#dao.getUserRiddles(userId);
	}

	getUserRiddleById(userId, riddleId) {
		return this.#dao.getUserRiddleById(userId, riddleId);
	}	

	getCountdownAndAnswers(userId, riddleId) {
		return this.#dao.getCountdownAndAnswers(userId, riddleId);
	}

	getUserRiddlesState(userId) {
		return this.#dao.getUserRiddlesState(userId);
	}

	getUserScore(userId) {
		return this.#dao.getUserScore(userId);
	}

}

module.exports = UserService;