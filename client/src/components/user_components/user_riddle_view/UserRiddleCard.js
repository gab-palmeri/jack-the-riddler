import { Button, Card, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';


function UserRiddleCard(props) {

	return (
		<Card>
			<Card.Header>
				<Row>
					<Col xs={{span:3, offset:7}} md={{span:2, offset:8}} lg={{span:2, offset:9}} xl={{span:3, offset:7}}>
						<Badge bg="secondary">Difficulty: {props.riddle.difficulty}</Badge>
					</Col>
					<Col xs="2" md="1" lg="1" xl="1">
						<Badge bg={props.riddle.state === 1 ? "success" : "secondary"}>{props.riddle.state === 1 ? "Open" : "Closed"}</Badge>
					</Col>
				</Row>
			</Card.Header>
			<Card.Body>
				<Card.Text>
					{props.riddle.question}
				</Card.Text>
					<Link to={"/myriddle/" + props.riddle.id}>
						<Button variant="success">Get details</Button>
					</Link>
				
			</Card.Body>
		</Card>
	);


}

export default UserRiddleCard;