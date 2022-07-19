import { Container, Spinner } from 'react-bootstrap';

import { useNavigate, useParams } from 'react-router-dom';
import { apiGetRiddle } from '../../utility/riddleAPI';
import { useEffect, useState } from 'react';
import OpenRiddle from './OpenRiddle';
import ClosedRiddle from './ClosedRiddle';


function RiddleSingle(props) {

	const [riddle, setRiddle] = useState({author: {}, answers:[], winner:{}});
	const [isRiddleLoading, setIsRiddleLoading] = useState(true);

	const {id} = useParams();
	const navigate = useNavigate();
	const {setLoading} = props;

	useEffect(() => {
		
		const getRiddle = async () => {
			try {
				const riddle = await apiGetRiddle(id);

				if(riddle.error === undefined) {
					setRiddle(riddle);
					setIsRiddleLoading(false);
				}
				else
					navigate('/riddle');

			} catch (err) {

				setLoading(true);
			}
		}
		getRiddle();
	}, [id, navigate, props.loggedIn, setLoading]);



	return (
		<Container className="mt-5">
			{
				isRiddleLoading ?
				<Spinner animation="border"/> :				
				riddle.state === 1 ? 
				<OpenRiddle setLoading={props.setLoading} riddle={riddle} setRiddle={setRiddle} /> : 
				<ClosedRiddle riddle={riddle} />
			}		
		</Container>
		
	);


}

export default RiddleSingle;