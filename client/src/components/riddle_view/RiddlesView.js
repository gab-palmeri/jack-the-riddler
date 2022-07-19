import { Container, Badge, Spinner, Tabs, Tab } from 'react-bootstrap';
import RiddleCard from './RiddleCard';
import {Link} from 'react-router-dom';

import { apiGetRiddles, apiGetRiddlesState } from '../../utility/riddleAPI';
import { useState, useEffect } from 'react';

import Slider from "react-slick";

function RiddlesView(props) {

	const [riddles, setRiddles] = useState([]);

	const [areRiddlesLoading, setAreRiddlesLoading] = useState(true);

	const { setLoading } = props;

	useEffect(() => {
		
		const getRiddles = async () => {
			try {
				const riddles = await apiGetRiddles();

				if(riddles.error === undefined) {
					setRiddles(riddles);
					setAreRiddlesLoading(false);
				}
				
			} catch (err) {

				setLoading(true);
			}
		}
		getRiddles();
	}, [props.loggedIn, setLoading]);


	useEffect(() => {

		const polling = async () => {

			try {

				//take all states of riddles remotely
				const states = await apiGetRiddlesState();

				if(states.error === undefined)
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
			catch (err) {
				setLoading(true);
			}
		}

		let id;
		if(props.loggedIn) 
			id = setInterval(polling, 1000);
		return () => clearInterval(id);

	}, [props.loggedIn, setLoading]);


	return (
		<>
			<Container className="mt-5">
				<Tabs defaultActiveKey="open" className="mb-3">
					<Tab eventKey="open" title="Open Riddles">
						{!props.loggedIn ? 
						<Link to="/login">
							<Badge className="mb-3" onClick={() => props.setSelected(3)} bg="success">
								Log-in to see riddles' details and answer them.
							</Badge>
						</Link> : null}
						{
							areRiddlesLoading ? <Spinner animation="border"/> :
							<Slider speed={500} slidesToShow={3} slidesToScroll={3} rows={3}>
								{riddles.length > 0 ?
								riddles.filter(riddle => riddle.state === 1).map(riddle => 
										<RiddleCard key={riddle.id} riddle={riddle} loggedIn={props.loggedIn}/>		
								)
								: <h3>No riddles yet</h3>	}
							</Slider>
						}
					</Tab>
					<Tab eventKey="close" title="Closed Riddles">
						{
							areRiddlesLoading ? <Spinner animation="border"/> :
							<Slider speed={500} slidesToShow={3} slidesToScroll={3} rows={3}>
								{riddles.length > 0 ?
									riddles.filter(riddle => riddle.state === 0).map(riddle =>
											<RiddleCard key={riddle.id} riddle={riddle} loggedIn={props.loggedIn}/>
									)
								: <h3>No riddles yet</h3>}
							</Slider>
						}
					</Tab>
				</Tabs>
			</Container>
		</>
	);


}

export default RiddlesView;