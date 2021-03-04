import logo from "./logo.svg";
import "./App.css";
import { Form, Col, Row, Button, Container } from "react-bootstrap";
function App() {
  return (
    <Container fluid className="App">
      <Form>
        <Form.Group as={Row} controlId="formHorizontalEmail">
          <Form.Label column sm={2}>
            Meet Link
          </Form.Label>
          <Col sm={10}>
            <Form.Control type="text" placeholder="url" />
          </Col>
        </Form.Group>

        <Form.Group as={Row}>
          <Col>
            <Button variant="success">Start</Button>
          </Col>
          <Col>
            <Button variant="danger">End</Button>
          </Col>
        </Form.Group>
      </Form>
    </Container>
  );
}

export default App;
