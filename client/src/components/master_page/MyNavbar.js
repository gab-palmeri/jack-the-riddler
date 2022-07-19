import { Row, Navbar, Col, Button, Offcanvas } from 'react-bootstrap';
import Sidebar from './Sidebar';

import { useState } from 'react';


function MyNavbar() {

	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

    return <>
        <Navbar className="d-sm-block d-md-none navbar">
			<Row className="navbar-row">
				<Col xs="3" sm="3">
					<Button className="ms-3 text-light" onClick={handleShow} variant="outline-dark">
						<i className='bi bi-list nav-icon' alt='collection'></i>
					</Button>
				
				</Col>

				<Col xs="7" sm="7" className="mx-auto">
					<Navbar.Brand className="text-light" href="#home">
						<img className="img-fluid" src="logo.png" alt="test"/>
					</Navbar.Brand>
				</Col>

			</Row>

			<Offcanvas show={show} onHide={handleClose}>
        		<Offcanvas.Header className="my-offcanvas" closeButton>
          			<Offcanvas.Title className="text-light">
						<img className="img-fluid" src="explore.png" alt="test"/>
					</Offcanvas.Title>
        		</Offcanvas.Header>
				<Offcanvas.Body className="my-offcanvas">
					<Sidebar offcanvas={true}/>
				</Offcanvas.Body>
      		</Offcanvas>

        </Navbar>
    </>
}

export default MyNavbar;