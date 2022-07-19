import { Container, Spinner } from 'react-bootstrap';

import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { apiGetUserRiddle } from '../../../utility/userAPI';

import UserOpenRiddle from './UserOpenRiddle';
import UserClosedRiddle from './UserClosedRiddle'; 


function UserRiddleSingle(props) {

	const [riddle, setRiddle] = useState({author: {}, answers:[], winner:{}});

	const [isRiddleLoading, setIsRiddleLoading] = useState(true);

	const {id} = useParams();
	const navigate = useNavigate();

	const { setSelected, setLoading } = props;

	useEffect(() => {
		
		const getRiddle = async () => {
			try {
				const riddle = await apiGetUserRiddle(id);
				
				if(riddle.error === undefined) {
					setRiddle(riddle);
					setIsRiddleLoading(false);
				}
				else {
					setSelected(0);
					navigate('/riddle');
				}
			} catch (err) {
				setLoading(true);
			}
		}
		getRiddle();
	}, [id, navigate, setLoading, setSelected ]);



	return (
		<Container className="mt-5">
			{
				isRiddleLoading ?
				<Spinner animation="border"/> :
				riddle.state === 1 ? 
				<UserOpenRiddle setLoading={setLoading} riddle={riddle} setRiddle={setRiddle} /> : 
				<UserClosedRiddle riddle={riddle} />
			}		
		</Container>
		
	);


}

export default UserRiddleSingle;