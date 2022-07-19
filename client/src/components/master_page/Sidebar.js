import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { logout } from '../../utility/userAPI';

import { useNavigate } from 'react-router-dom'; 

function Sidebar(props) {


		const navigate = useNavigate();

		const doLogout = () =>{
			logout().then(user => {
				props.setLoggedIn(false);
				props.setUser({});

				props.setSelected(0);
				navigate("/riddle");

			}, error => {
				props.setLoading(true);
			});
		}

		let accountButtons;

		if(props.loggedIn) {
			accountButtons = 
				<>
					<Link to="/myriddle">
						<Button size="md" onClick={() => props.setSelected(5)} className={(props.selected === 5 ? "sidebar-button-active " : " ") + "sidebar-button text-start text-light w-100"} variant="trasparent">
							<i className="bi bi-journal-text me-1"></i> Your Riddles
						</Button>
					</Link>
					
					<Button onClick={doLogout} size="md" className="sidebar-button button-text text-start text-light w-100" variant="trasparent">
						<i className="bi bi-box-arrow-left"></i> Logout
					</Button>	
				</>;
		}
		else {
			accountButtons = 
				<>
					<Link to="/login">
						<Button onClick={() => props.setSelected(3)} size="md" className={(props.selected === 3 ? "sidebar-button-active " : " ") + "sidebar-button text-start text-light w-100"} variant="trasparent">
							<i className="bi bi-person me-1"></i> Log-in
						</Button>
					</Link>
				</>
		}

        return (
			<aside expand="lg">
				
				<img className={props.offcanvas === true ? "d-none" : "img-fluid"} src="logo.png" alt="test"/>

                <div className={`d-grid gap-3 ${props.offcanvas === true ? "" : "mt-5"}`}>
					<Link to="riddle">
						<Button onClick={() => props.setSelected(0)} size="md" className={(props.selected === 0 ? "sidebar-button-active " : " ") + "sidebar-button text-start text-light w-100"} variant="trasparent">
							<i className="bi bi-patch-question me-1"></i> Browse Riddles
						</Button>
					</Link>
					<Link to="/bestusers">
						<Button onClick={() => props.setSelected(1)} size="md" className={(props.selected === 1 ? "sidebar-button-active " : " ") + "sidebar-button text-start text-light w-100"} variant="trasparent">
							<i className="bi bi-trophy me-1"></i> Top 3 Riddlers
						</Button>
					</Link>
					<hr className="text-light"/>
					{accountButtons}
                </div>
				
        	</aside>
		);
}

export default Sidebar;