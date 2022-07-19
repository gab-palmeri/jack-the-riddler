import { useState, useEffect } from 'react';
import { Card, Container, Alert, Col, Row, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


import UserRiddleCard from './UserRiddleCard';
import RiddleModal from './RiddleModal';
import { apiGetUserRiddles, apiGetUserRiddlesState, apiGetUserScore } from '../../../utility/userAPI';



function UserRiddlesView(props) {

	const [riddles, setRiddles] = useState([]);
	const [areRiddlesLoading, setAreRiddlesLoading] = useState(true);

	const [score, setScore] = useState();
	
	const [showModal, setShowModal] = useState(false);

	const navigate = useNavigate();

	const { setSelected, setLoading } = props;

	//get user riddles
	useEffect(() => {
		
		const getUserRiddles = async () => {
			try {
				const riddles = await apiGetUserRiddles();

				if(riddles.error === undefined) {
					setRiddles(riddles);
					setAreRiddlesLoading(false);
				}
				else {
					setSelected(0);
					navigate("/riddle");
				}
			} catch (err) {
				setLoading(true);
			}
		}

		getUserRiddles();
	}, [navigate, setSelected, setLoading]);

	//The user data is loaded at login: the score could change after this, so we load it individually
	useEffect(() => {
		const getUserScore = async () => {
			try {
				const score = await apiGetUserScore();

				if(score.error === undefined) {
					setScore(score.score);
				}
				else {
					setSelected(0);
					navigate("/riddle");
				}
			} catch (err) {
				setLoading(true);
			}
		}

		getUserScore();
	}, [navigate, setLoading, setSelected]);

	useEffect(() => {

		const polling = async () => {

			try {
				//take all states of riddles remotely
				const states = await apiGetUserRiddlesState();

				if(states.error === undefined) {
					//overwrite local riddles states with remote riddles states
					setRiddles(riddles => {
						return riddles.map(riddle => {
							const remoteRiddle = states.find(state => state.id === riddle.id);
							if (remoteRiddle) {
								return { ...riddle, state: remoteRiddle.state };
							} else {
								return riddle;
							}
						});
					});
				}
				else {
					setSelected(0);
					navigate("/riddle");
				}

			}
			catch (err) {
				setLoading(true);
			}
		}

		const id = setInterval(polling, 1000);
		return () => clearInterval(id);

	}, [navigate, setLoading, setSelected]);

	const handleClose = () => setShowModal(false);
	const handleShow = () => setShowModal(true);

	return (

		<Container className="mt-5">

			<Card className="mt-3">
					<Card.Header>
						<h1>Hello, {props.user.name}</h1>
					</Card.Header>
					<Card.Body>
						<Row>
							<Col xs={12} lg={4} className="mb-2">
								<Card>
									<Card.Header>
										Personal Data
									</Card.Header>
									<Card.Body>
										<Alert variant="info">
											Name: {props.user.name} <br/>
											Surname: {props.user.surname} <br/>
											Email: {props.user.email} <br/>
										</Alert>
									</Card.Body>
								</Card>
							</Col>
							<Col xs={12} lg={8}>
								<Alert variant="secondary">
									You have published {riddles.length} riddle(s).
								</Alert>
								<Alert variant="secondary">
									You have {score} points.
								</Alert>
								<Alert variant="success">
									&#128077; Keep up the good work!
								</Alert>
							</Col>
						</Row>
						<Card className="mt-5">
							<Card.Header>
								<Row>
									<Col xs="11">
										<h3>Your Riddles</h3>
									</Col>
									<Col xs="1">
										<Button variant="success" size="sm" onClick={() => handleShow()}>
											<small>New Riddle</small>
										</Button>
									</Col>
								</Row>
							</Card.Header>
							<Card.Body>
								<Row xs="12" md="3" className="mt-2">
									{
										areRiddlesLoading ?
										<Spinner animation="border"/> :
										riddles.length > 0 ?
										riddles.map(riddle =>
											<Col key={riddle.id} xs="12" sm="12" md="12" lg="12" xl="4">
												<UserRiddleCard user={props.user} riddle={riddle} />
											</Col> 
										)
										:
										<span>&#128531; You have no riddles. Create one now!</span>
										
									}
								</Row>
							</Card.Body>
						</Card>
					</Card.Body>
				</Card>

				<RiddleModal showModal={showModal} handleClose={handleClose} riddles={riddles} setRiddles={setRiddles}/>			
			
		</Container>
	);


}

export default UserRiddlesView;