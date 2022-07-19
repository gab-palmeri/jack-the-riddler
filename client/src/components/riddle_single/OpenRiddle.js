import { Button, Card, Container, Row, Col, Alert, Badge, Form } from 'react-bootstrap';
import { useState } from 'react';

import { apiAnswerRiddle, apiGetRiddle, apiGetCountdown, apiGetFirstTip, apiGetSecondTip } from '../../utility/riddleAPI';
import { useEffect } from 'react';


function OpenRiddle(props) {

	const [answer, setAnswer] = useState("");
	const [error, setError] = useState("");
	const [countdown, setCountdown] = useState();

	const [firstTip, setFirstTip] = useState("");
	const [secondTip, setSecondTip] = useState("");


	const [isAnswered, setIsAnswered] = useState(false);

	const {riddle, setRiddle, setLoading} = props;

	/* If we already have an answer, set the answer and isAnswered state variables accordingly */
	useEffect(() => {
		
		if(props.riddle.user_answer !== null) {
			setAnswer(props.riddle.user_answer);
			setIsAnswered(true);
		}

	}, [props.riddle.user_answer]);

	
	useEffect(() => {
		const getSeconds = async (test) => {

			try {
				const response = await apiGetCountdown(riddle.id);

				if(response.seconds >= 0) {
					setCountdown(response.seconds);
				}
				else if(response.seconds === -1){
					const closedRiddle = await apiGetRiddle(riddle.id);
					setRiddle(closedRiddle);
				}
			}
			catch (err) {
				setLoading(true);
			}
		}

		getSeconds();

		const id = setInterval(getSeconds, 1000);
		return () => clearInterval(id)
	}, [riddle.id, setRiddle, riddle.duration, setLoading]);


	//This use effect is used to get the first tip and second tip
	//Initially, this code was all in the SECOND use effect, but it was moved here
	//because the ifs below were not working properly. Still, this use effect is executed
	//basically every second of the countdown, so it's fine.
	useEffect(() => {
		
		const setTips = async () => {
			//if the countdown is 50% of the duration, show the first tip
			if(firstTip.length === 0 && countdown <= Math.floor(riddle.duration / 2)) {
				setFirstTip(await apiGetFirstTip(riddle.id));
			}
			if(secondTip.length === 0 && countdown <= Math.floor(riddle.duration / 4)) {
				setSecondTip(await apiGetSecondTip(riddle.id));
			}
		}
		setTips();

	}, [countdown, firstTip, secondTip, riddle.duration, riddle.id]);


	const padTo2Digits = (num) => {
  		return num.toString().padStart(2, '0');
	}

	/* After having sent the answer, set the "answer" and "isAnswered" to match the new value */
	const handleSubmit = async (event) => {

        event.preventDefault();
        if (answer.trim().length > 0) {
           
			try {
				const closedRiddle = await apiAnswerRiddle(props.riddle.id, answer);

				if(closedRiddle.error === undefined) {
					if(closedRiddle.correct_answer === true) {
						props.setRiddle(closedRiddle.riddle);
					}

					setIsAnswered(true);
					setAnswer(answer);
				}
				else {
					setError(closedRiddle.error);
				}
			}
			catch(error) {
				props.setLoading(true);
			}

        } else {
            setError("Write an answer!");
        }
    }

	return (
		<Container className="mt-5">
			{/* First row */}
			<Row>
				<Col className="mb-2" md="8" xs="12">
					<Card>
						<Card.Header>
							<Row>
								<Col xs="9" sm="9" md="8" lg="9" xl="10">
									<i className="bi bi-person-circle"></i> {props.riddle.author.name} {props.riddle.author.surname}
								</Col>
								<Col xs="3" sm="3" md="4" lg="3" xl="2">
									<Badge className="" bg="secondary">Difficulty: {props.riddle.difficulty}</Badge>
								</Col>
							</Row>
						</Card.Header>
						<Card.Body>
							<Card.Text>
								{props.riddle.question}
							</Card.Text>
						</Card.Body>
					</Card>
				</Col>
				<Col md="4" xs="12">
					<Card>
						<Card.Header><i className="bi bi-reply-all"></i> Tips </Card.Header>
						<Card.Body>
							<Alert variant="info">
								First tip: {
									firstTip.length > 0 ? 
									firstTip : 
									countdown !== undefined ? 
									"Available in " + padTo2Digits(countdown - Math.floor(props.riddle.duration / 2)) + " seconds" :
									"Available when the countdown reaches half of the time"
								}
							</Alert>
							<Alert variant="success">
								Second tip: {
									secondTip.length > 0? 
									secondTip : 
									countdown !== undefined ? 
									"Available in " + padTo2Digits(countdown - Math.floor(props.riddle.duration / 4)) + " seconds" :
									"Available when the countdown reaches a quarter of the time"
								}
							</Alert>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			{/* Second row */}
			<Row>
				<Col md="8" xs="12" className="mt-2">
					<Card>
						<Card.Body>
							<Form className="padding-all-20" onSubmit={ev => handleSubmit(ev)}>
								{
									!isAnswered ?
									<Form.Group controlId="formFilmTitle">
										<Form.Control
											type="text"
											name="answer"
											placeholder="Enter your answer.."
											value={answer}
											className={error ? 'border border-danger' : ''}
											onChange={ev => {
												setAnswer(ev.target.value);
												setError("");
											}}
											autoFocus
										/>
									</Form.Group> :
									/* Answer contains either the old props.riddle.user_answer, or the new answer the user just inserted */
									<span>Answer: {answer}</span>
								}

								<Button variant="primary" className="mt-2 w-100" type="submit" disabled={(isAnswered)}>
									{!(isAnswered) ? "Answer this riddle" : "You've already answered this riddle"}
								</Button>
								{error ? <Alert className="mt-2" variant="danger" onClose={() => setError("")} dismissible>{error}</Alert> : null}

							</Form>	
						</Card.Body>
					</Card>
				</Col>
				<Col md="4" xs="12" className="mt-2">
					<Card>
						<Card.Body className="text-center">
							{
								countdown !== undefined ?
								<h2>{padTo2Digits(Math.floor(countdown / 60))}:{padTo2Digits(countdown % 60)}</h2> :
								<h4>Be the first to answer to start the countdown!</h4>
							}
						</Card.Body>
					</Card>
				</Col>
			</Row>
			
		</Container>
		
	);


}

export default OpenRiddle;