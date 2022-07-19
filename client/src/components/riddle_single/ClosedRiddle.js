import { Button, Card, Container, Row, Col, Alert, Badge } from 'react-bootstrap';



function ClosedRiddle(props) {

	return (

		<Container className="mt-5">
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
						<Card.Header><i className="bi bi-reply-all"></i> Answers </Card.Header>
						<Card.Body>
							{props.riddle.answers.map((answer, index) => {
								return (
									<Alert key={index} variant="info">
										{answer.name} {answer.surname}: {answer.answer}
									</Alert>
								);
							})}
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Row>
				<Col md="8" xs="12" className="mt-2">
					<Card>
						<Card.Body>
							<Button variant="primary" className="w-100" disabled>The riddle is closed</Button>
							
						</Card.Body>
					</Card>
				</Col>
				<Col md="4" xs="12" className="mt-2">
					<Card>
						<Card.Body className="text-center">
							<h4>Winner: {props.riddle.winner != null ? props.riddle.winner.name + " " + props.riddle.winner.surname : "No one!"}</h4>
							<h5>Answer: {props.riddle.answer}</h5>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			
		</Container>
		
	);


}

export default ClosedRiddle;