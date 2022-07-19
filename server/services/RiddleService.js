"use strict";

class RiddleService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

	createRiddle = async (userId, riddle) => {
        await this.#dao.createRiddle(userId, riddle);
    }

	getRiddles = async (userId) => {
		return await this.#dao.getRiddles(userId);
	}

	getRiddleById = async (id, userId) => {
		return await this.#dao.getRiddleById(id, userId);
	}

	answerRiddle = async (id, answer, userId) => {
		return await this.#dao.answerRiddle(id, answer, userId);
	}

	getRiddlesPreview = async () => {
		return await this.#dao.getRiddlesPreview();
	}

	getCountdown = async (id, userId) => {
		return await this.#dao.getCountdown(id, userId);
	}

	getFirstTip = async (id) => {
		return await this.#dao.getFirstTip(id);
	}

	getSecondTip = async (id) => {
		return await this.#dao.getSecondTip(id);
	}

	getRiddlesState = async (userId) => {
		return await this.#dao.getRiddlesState(userId);
	}

}

module.exports = RiddleService;