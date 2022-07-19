import { Card, Container, Table, Alert, Spinner } from 'react-bootstrap';

import { apiGetBestThree } from '../../utility/userAPI';
import { useState, useEffect } from 'react';


function BestUsers(props) {

	const [users, setUsers] = useState([]);

	const [areUsersLoading, setAreUsersLoading] = useState(true);

	const { setLoading } = props;

	useEffect(() => {
		const getBestUsers = async () => {
			try {
				const users = await apiGetBestThree();

				if(users.error === undefined)
				{
					setUsers(users);
					setAreUsersLoading(false);
				}

			} catch (err) {
				setLoading(true);
			}
		}
		getBestUsers();

	}, [setLoading]);


	return (

		<Container className="mt-5">
			

			<Card className="mt-3">
					<Card.Header>
						<h1>Best Riddlers</h1>
					</Card.Header>
					<Card.Body>
						{
						areUsersLoading ?
						<Spinner animation="border"/> :
						<Table bordered hover size="lg">
							<thead>
								<tr>
									<th>#</th>
									<th>Name</th>
									<th>Surname</th>
									<th>Score</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user,index) => 
									<tr key={index}>
										<td>{index+1}</td>
										<td>{user.name}</td>
										<td>{user.surname}</td>
										<td>{user.score}</td>
									</tr>
								)}
							</tbody>
							</Table>
						}
					</Card.Body>
				</Card>
				
				<Alert className="mt-2" variant="info">
					&#128161;
					To obtain points, complete riddles!
				</Alert>


			
		</Container>
	);


}

export default BestUsers;