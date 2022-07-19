import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

import { useState } from "react";
import { apiCreateRiddle } from "../../../utility/riddleAPI";
import { apiGetUserRiddles } from "../../../utility/userAPI";

function RiddleModal(props) {

	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [difficulty, setDifficulty] = useState();
	const [duration, setDuration] = useState();
	const [firstTip, setFirstTip] = useState("");
	const [secondTip, setSecondTip] = useState("");

	const [error, setError] = useState("");

	const { setLoading } = props;

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		const questionValid = question.trim().length > 0;
		const answerValid = answer.trim().length > 0 ;
		const difficultyValid = Number(difficulty) >= 1 && Number(difficulty) <= 3;
		const durationValid = Number(duration) >= 30 && Number(duration) <= 600;
		const firstTipValid = firstTip.trim().length > 0;
		const secondTipValid = secondTip.trim().length > 0;

		if(!questionValid) {
			setError("Question is required");
			return;
		}
		if(!answerValid) {
			setError("Answer is required");
			return;
		}
		if(!difficultyValid) {
			setError("Difficulty is required");
			return;
		}
		if(!durationValid) {
			setError("Enter a duration in seconds between 30 and 600 seconds");
			return;
		}
		if(!firstTipValid) {
			setError("First tip is required");
			return;
		}
		if(!secondTipValid) {
			setError("Second tip is required");
			return;
		}
		
		setError("");
		
		try {
			const response = await apiCreateRiddle({question, answer, difficulty, duration, firstTip, secondTip});

			if(response == null) {
				const riddles = await apiGetUserRiddles();
				props.setRiddles(riddles);
			}
			else {
				setError(response.error);
			}
			

		} catch (err) {
			setLoading(true);
		}

		props.handleClose();

	}

	const localHandleClose = () => {
		//reset all state variables
		setQuestion("");
		setAnswer("");
		setDifficulty();
		setDuration();
		setFirstTip("");
		setSecondTip("");
		setError("");
		props.handleClose();
	}

	return (
		<Modal show={props.showModal} onHide={localHandleClose} backdrop="static">
			<Modal.Header closeButton>
				<Modal.Title>Modal heading</Modal.Title>
				
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={(e) => handleSubmit(e)}>
					<Form.Group className="mb-3" controlId="question">
						<Form.Label>Question</Form.Label>
						<Form.Control as="textarea" placeholder="Insert your question..." value={question || ''} onChange={ev => setQuestion(ev.target.value)}/>
					</Form.Group>

					<Form.Group className="mb-3" controlId="answer">
						<Form.Label>Answer</Form.Label>
						<Form.Control placeholder="Insert the answer..." value={answer || ''} onChange={ev => setAnswer(ev.target.value)} />
					</Form.Group>

					<Row className="mb-3">
						<Form.Group as={Col} controlId="difficulty">
						<Form.Label>Difficulty</Form.Label>
							<Form.Select defaultValue={difficulty || 0} onChange={ev => setDifficulty(ev.target.value)}>
								<option value="0">Choose...</option>
								<option value="1">1 (Easy)</option>
								<option value="2">2 (Medium)</option>
								<option value="3">3 (Hard)</option>
							</Form.Select>
						</Form.Group>

						<Form.Group as={Col} controlId="duration">
							<Form.Label>Duration (in seconds)</Form.Label>
							<Form.Control value={duration || ''} onChange={ev => setDuration(ev.target.value.replace(/\D/,''))} placeholder="Value between 30 and 600" />
						</Form.Group>
					</Row>

					<Row className="mb-3">

						<Form.Group as={Col} controlId="firstTip" >
							<Form.Label>First tip</Form.Label>
							<Form.Control as="textarea" value={firstTip || ''} onChange={ev => setFirstTip(ev.target.value)}/>
						</Form.Group>

						<Form.Group as={Col} controlId="secondTip">
							<Form.Label>Second tip</Form.Label>
							<Form.Control as="textarea" value={secondTip || ''} onChange={ev => setSecondTip(ev.target.value)}/>
						</Form.Group>
					</Row>

					<Button variant="primary" type="submit" className="mx-auto">
						Create Riddle
					</Button>

					{error ? <Alert variant="danger" className="mt-3" onClose={() => setError("")} dismissible>{error}</Alert> : null}
						
						
					
				</Form>
			</Modal.Body>
		</Modal>
	);
}

export default RiddleModal;