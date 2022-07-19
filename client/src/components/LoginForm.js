import { useEffect, useState } from 'react';
import { Container, Form, FormGroup, Col, Row, Alert, Button, Spinner } from 'react-bootstrap';
import Slider from "react-slick";
import { Link } from 'react-router-dom';

import { useNavigate } from 'react-router';
import { login } from '../utility/userAPI';
import RiddleCard from './riddle_view/RiddleCard';

import {apiGetRiddlesPreview} from '../utility/riddleAPI';

import { validate as emailValidator } from 'react-email-validator';


function LoginForm(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState("");
	const [riddles, setRiddles] = useState([]);

	const [loginLoading, setLoginLoading] = useState(false);
	const [isPreviewLoading, setIsPreviewLoading] = useState(true);

	const navigate = useNavigate();

	const { setLoading } = props;

	useEffect(() => {
		
		const getRiddlesPreview = async () => {
			try {
				const riddles = await apiGetRiddlesPreview();

				if(riddles.error === undefined) {
					setRiddles(riddles);
					setIsPreviewLoading(false);
				}
				else
					setLoginError("Error while getting riddles preview");
			} catch (err) {
				setLoading(true);
			}
		}
		getRiddlesPreview();
	}, [setLoading]);



    const handleSubmit = (event) => {

		setLoginLoading(true);

        event.preventDefault();

		let isValidEmail = emailValidator(email);
		let isValidPassword = password.trim().length > 0;

		if(isValidEmail && isValidPassword) {
			doLogin(email, password);
		}
        else if (!isValidEmail && isValidPassword) {
            setLoginError("Email is not valid");
			setLoginLoading(false);
        }
        else if (!isValidPassword && isValidEmail) {
            setLoginError("Password is not valid");
			setLoginLoading(false);
        }
		else {
            setLoginError("Email and Password are not valid");
			setLoginLoading(false);
        }

		
    }

	const doLogin = async (email, password) =>{

		try {
			const user = await login(email, password);
			
			if(user.message === undefined) {
				props.setLoggedIn(true);
				props.setUser(user);
				props.setSelected(0);
				setLoginLoading(false);

				navigate('/riddle');
			}
			else {
				setLoginError(user.message);
				setLoginLoading(false);
			}
		}
		catch (err) {
			setLoading(true);
		}
	}


	const responsiveSliderOptions = [
	{
		breakpoint: 1600,
		settings: {
		slidesToShow: 3,
		slidesToScroll: 3,
		infinite: true,
		dots: true
		}
	},
	{
		breakpoint: 600,
		settings: {
		slidesToShow: 2,
		slidesToScroll: 2,
		initialSlide: 2
		}
	},
	{
		breakpoint: 480,
		settings: {
		slidesToShow: 1,
		slidesToScroll: 1
		}
	}
	]


    return (
        <Container>
            <Row>
                <Col xs="10" md="5" className="mt-5">
                    <h2>Login</h2>

                    <Form>
                        {
							loginError ? 
							<Alert variant="danger" onClose={() => setLoginError("")} dismissible>{loginError}</Alert> 
							: null
						}

                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" value={email} onChange={ev => setEmail(ev.target.value)} className={ + loginError.includes("Email") ? 'border border-danger' : ''} />
                        </Form.Group>

                        <FormGroup controlId="password">
                            <Form.Label>
                                Password
                            </Form.Label>
                            <Form.Control type="password" value={password} onChange={ev => setPassword(ev.target.value)} className={loginError.includes("Password") ? 'border border-danger' : ''} />
                        </FormGroup>

                        <Button variant="primary" disabled={loginLoading} onClick={!loginLoading ? handleSubmit : null} type="submit" className='mt-3'>
							{
								loginLoading ?
								<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...</span>
								: "Login"
							}
						</Button>
                    </Form>
                </Col>
				<Col xs={{offset:3}} className="mt-5">
					<Alert className="mt-2">
						<h4>Do you want to remain anonymous?</h4>
						<p className="mt-3">
							You can log-in later
						</p>
						<Link to="/riddle">
							<Button variant="primary" onClick={() => {props.setSelected(0); navigate('/register');}}>Browse as a guest</Button>
						</Link>
					</Alert>
				</Col>
            </Row>
			<Row className="mt-5">
				<h1 className="mt-5 mb-4">Join thousand of riddlers across the world</h1>
					{
						isPreviewLoading ?
						<Spinner animation="border"/> :
						<Slider autoplay={true} autoplaySpeed={3000} dots={true} infinite={true} speed={500} slidesToShow={3} slidesToScroll={3} responsive={responsiveSliderOptions}>
						
							{riddles.map(riddle => 
								<div key={riddle.id}>
									<RiddleCard key={riddle.id} riddle={riddle} />
								</div>
							)}
						</Slider>
					}
			</Row>
        </Container>
    )
}

export default LoginForm
