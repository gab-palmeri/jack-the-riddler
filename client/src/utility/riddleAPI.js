import { SERVER_URL } from './SERVER_URL.js';

async function apiGetRiddles() {
	
    const response = await fetch(new URL('riddle', SERVER_URL), {
        credentials: 'include'
    });

    const riddles = await response.json();

    return riddles;
}

async function apiGetRiddlesPreview() {
	const response = await fetch(new URL('riddle/preview', SERVER_URL), {
        credentials: 'include'
    });

    const riddles = await response.json();

    return riddles;
}

async function apiGetRiddle(id) {

	const response = await fetch(new URL('riddle/' + id, SERVER_URL), {
        credentials: 'include'
    });

    const riddle = await response.json();

	return riddle;
}

async function apiAnswerRiddle(id, answer) {

	const response = await fetch(new URL('riddle/' + id, SERVER_URL), {
		credentials: 'include',
		method: 'POST',
		headers: {
        	'Content-Type': 'application/json',
      	},
		body: JSON.stringify({answer: answer}),
	});

	//this handles all possible problems: answering a riddle for the second time, answering a riddle that the user himself created..
	//even though the GUI already blocks this, we want to handle it to be safer
	const json = await response.json();
	
	return json;
}

async function apiGetCountdown(id) {

	const response = await fetch(new URL('riddle/' + id + '/countdown', SERVER_URL), {
		credentials: 'include'
	});

	const expiryDate = await response.json();

	if (response.ok) {
		return expiryDate;
	} else {
		throw expiryDate;  
	}
}

async function apiGetFirstTip(id) {
	
	const response = await fetch(new URL('riddle/' + id + '/first_tip', SERVER_URL), {
		credentials: 'include'
	});

	const firstTip = await response.json();

	if (response.ok) {
		return firstTip;
	} else {
		throw firstTip;  
	}
}

async function apiGetSecondTip(id) {

	const response = await fetch(new URL('riddle/' + id + '/second_tip', SERVER_URL), {
		credentials: 'include'
	});

	const secondTip = await response.json();

	if (response.ok) {
		return secondTip;
	} else {
		throw secondTip;
	}
}

async function apiGetRiddlesState() {
	
	const response = await fetch(new URL('riddle/state', SERVER_URL), {
		credentials: 'include'
	});

	const riddlesState = await response.json();

	return riddlesState;
}

async function apiCreateRiddle(riddle) {
	
	const response = await fetch(new URL('riddle', SERVER_URL), {
		credentials: 'include',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
	  	},
		body: JSON.stringify(riddle),
	});

	if (response.ok) {
		return;
	} else {
		const json = await response.json();
		return json;
	}
}

export {apiGetRiddles, apiGetRiddlesPreview, apiGetRiddle, apiAnswerRiddle, apiGetCountdown, apiGetFirstTip, apiGetSecondTip, apiGetRiddlesState, apiCreateRiddle};