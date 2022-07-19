import { Container, Spinner } from 'react-bootstrap';


function LoadingScreen() {
    return (
        <Container className='h-100 w-50 p-5 text-center'>
			<h1>Loading</h1><br/>
            <Spinner animation="grow" variant="danger"/> <br/>
            <small><b>If this takes too much time, there could be a server error. Retry later</b></small>
        </Container>
    )
}

export default LoadingScreen;