import { SERVER_URL } from './SERVER_URL.js';


// login
async function login(email, password) {
    const response = await fetch(new URL('user/login', SERVER_URL), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: email, password: password}),
    }).catch(error => {
		throw new Error("There was a problem with the server. Retry later");
	});

	const user = await response.json();
	return user;
}

async function logout() {
	
    await fetch(new URL('user/logout', SERVER_URL), {
        method: 'DELETE',
        credentials: 'include'
    });
};

async function apiGetUser() {
	
    const response = await fetch(new URL('user', SERVER_URL), {
        credentials: 'include'
    });

    const user = await response.json();

    return user;
}

async function apiGetBestThree() {
	const response = await fetch(new URL('user/best', SERVER_URL), {
		credentials: 'include'
	});

	const bestThree = await response.json();

	return bestThree;
}

async function apiGetUserRiddles() {
	const response = await fetch(new URL('user/riddle', SERVER_URL), {
		credentials: 'include'
	});

	const userRiddles = await response.json();

	return userRiddles;
}

async function apiGetUserRiddle(id) {
	const response = await fetch(new URL(`user/riddle/${id}`, SERVER_URL), {
		credentials: 'include'
	});

	const userRiddle = await response.json();

	return userRiddle;
}

async function apiGetCountdownAndAnswers(id) {

	const response = await fetch(new URL(`user/riddle/${id}/countdown_answers`, SERVER_URL), {
		credentials: 'include'
	});

	const countdownAndAnswers = await response.json();

	return countdownAndAnswers;
}

async function apiGetUserRiddlesState() {
	const response = await fetch(new URL('user/riddle/state', SERVER_URL), {
		credentials: 'include'
	});

	const userRiddlesState = await response.json();

	return userRiddlesState;
}

async function apiGetUserScore() {
	const response = await fetch(new URL('user/score', SERVER_URL), {
		credentials: 'include'
	});

	const userScore = await response.json();

	return userScore;
}


export {
	login, 
	logout, 
	apiGetUser, 
	apiGetBestThree, 
	apiGetUserRiddles, 
	apiGetUserRiddle, 
	apiGetCountdownAndAnswers, 
	apiGetUserRiddlesState, 
	apiGetUserScore
};
