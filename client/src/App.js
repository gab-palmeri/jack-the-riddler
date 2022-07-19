import './App.css';
import MyNavbar from './components/master_page/MyNavbar';
import Sidebar from './components/master_page/Sidebar';
import RiddlesView from './components/riddle_view/RiddlesView';
import RiddleSingle from './components/riddle_single/RiddleSingle';
import LoginForm from './components/LoginForm';
import BestUsers from './components/user_components/BestUsers';
import UserRiddlesView from './components/user_components/user_riddle_view/UserRiddlesView';
import UserRiddleSingle from './components/user_components/user_riddle_single/UserRiddleSingle';
import LoadingScreen from './components/LoadingScreen';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import { apiGetUser } from './utility/userAPI';

function App() {

	const routes = {"":0, "riddle": 0, "bestusers": 1,"login": 3};

	const [user, setUser] = useState({});
	const [loggedIn, setLoggedIn] = useState(false);
	const [selected, setSelected] = useState(routes[window.location.pathname.split("/")[1]]);

	const [loading, setLoading] = useState(false);


	useEffect(() => {
    	const checkIfLogged = async () => {
			try {
				const user = await apiGetUser();

				if(user.id !== undefined) {
					setUser(user);
					setLoggedIn(true);
				}

				setLoading(false);

			} catch (err) {
				
			}

		};

		checkIfLogged();
  	}, []);

	return (
		<>
			<Router>
				{
					loading ?
					<LoadingScreen /> :
					<>
					<MyNavbar/>

					<Row className="m-auto">
						<Col lg="2" md="3" className="sidebar d-none d-md-block">
							<Sidebar setLoading={setLoading} selected={selected} setSelected={setSelected} loggedIn={loggedIn} setUser={setUser} setLoggedIn={setLoggedIn} offcanvas={false}></Sidebar>
						</Col>
						<Col lg="10" md="9" className='mt-3'>
							<Routes>
								<Route index element={<Navigate to="/riddle"/>} />
								<Route path="/riddle" element={<RiddlesView setLoading={setLoading} setSelected={setSelected} loggedIn={loggedIn}/>} />
								<Route path="/riddle/:id" element={<RiddleSingle setLoading={setLoading} loggedIn={loggedIn}/>}/>
								<Route path="/login" element={
									!loggedIn ? <LoginForm setLoading={setLoading} setSelected={setSelected} setLoggedIn={setLoggedIn} setUser={setUser} /> : <Navigate to="/riddle"/>} 
								/>
								<Route path="/bestusers" element={<BestUsers setLoading={setLoading}/>} />
								<Route path="/myriddle" element={
									<UserRiddlesView setLoading={setLoading} user={user} setSelected={setSelected}/>
								} />
								<Route path="/myriddle/:id" element={<UserRiddleSingle setSelected={setSelected} setLoading={setLoading}/>} />

							</Routes>
						</Col>
					</Row>
					</>
				}
				
			</Router>
		</>
	);
  }
	
export default App;
