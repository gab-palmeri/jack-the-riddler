import { Button, Card, OverlayTrigger, Tooltip, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';


function RiddleCard(props) {

	return (
		<Card>
			<Card.Header>
				<Row>
					<Col xs="9" md="9" lg="10" xl="9">
						<i className="bi bi-person-circle"></i> {props.riddle.author.name} {props.riddle.author.surname}
					</Col>
					<Col xs="3"md="2" lg="2" xl="3">
						<Badge bg="secondary">Difficulty: {props.riddle.difficulty}</Badge>
					</Col>
				</Row>
			</Card.Header>
			<Card.Body>
				<Card.Text>
					{props.riddle.question}
				</Card.Text>
				{
					!props.loggedIn ? 
					<OverlayTrigger placement="right" overlay={<Tooltip>You <strong>must</strong> be logged in to answer the riddle</Tooltip>}>
						<span className="d-inline-block">
							<Button variant="success" disabled>Get details</Button>
						</span>
					</OverlayTrigger> :
					<Link to={"/riddle/" + props.riddle.id}>
						<Button variant="success">Get details</Button>
					</Link>
				}
			</Card.Body>
		</Card>
	);


}

export default RiddleCard;