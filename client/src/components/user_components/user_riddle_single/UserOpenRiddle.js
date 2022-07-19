import { Card, Container, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useState } from 'react';

import { useEffect } from 'react';

import { apiGetCountdownAndAnswers } from '../../../utility/userAPI';
import { useNavigate } from 'react-router';


function OpenRiddle(props) {

	const [countdown, setCountdown] = useState();
	const [answers, setAnswers] = useState([{}]);

	const {riddle, setRiddle, setLoading} = props;

	const navigate = useNavigate();

	useEffect(() => {
		const getSeconds = async () => {

			try {
				const response = await apiGetCountdownAndAnswers(riddle.id);

				if(response.error === undefined) {
					if(response.seconds >= 0) {
						setCountdown(response.seconds);
						setAnswers(response.answers);
					}
					else if(response.seconds === -1){
						setRiddle(response.riddle);
					}
				}
				else {
					//add set selected
					navigate('/riddle');
				}
			}
			catch (err) {
				setLoading(true);
			}
		}

		setAnswers(riddle.answers);
		getSeconds();
		const id = setInterval(getSeconds, 1000);
		return () => clearInterval(id)
	}, [riddle, setRiddle, setLoading, navigate]);

	const padTo2Digits = (num) => {
  		return num.toString().padStart(2, '0');
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
									<i className="bi bi-person-circle"></i> Here's your riddle:
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
						<Card.Header><i className="bi bi-reply-all"></i> Answers </Card.Header>
						<Card.Body>
							{
								answers.lenght !== 0 ?
								answers.map((answer, index) => {
									return (
										<Alert key={index} variant="info">
											{answer.name} {answer.surname}: {answer.answer}
										</Alert>
									)})
								: "No answers yet."
							}
						</Card.Body>
					</Card>
				</Col>
			</Row>
			{/* Second row */}
			<Row>
				<Col md="8" xs="12" className="mt-2">
					<Card>
						<Card.Body>
							<Alert variant="success" className="text-center">The riddle is open</Alert>
						</Card.Body>
					</Card>
				</Col>
				<Col md="4" xs="12" className="mt-2">
					<Card>
						<Card.Body className="text-center">
							{
								countdown !== undefined ?
								<h2>{padTo2Digits(Math.floor(countdown / 60))}:{padTo2Digits(countdown % 60)}</h2> :
								<h4>When someone answers the riddle, the countdown will start.</h4>
							}
						</Card.Body>
					</Card>
				</Col>
			</Row>
			
		</Container>
		
	);


}

export default OpenRiddle;