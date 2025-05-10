// Login.jsx
// Handles user login by collecting credentials and sending a POST request to the backend

import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const emailRegex = /\S+@\S+\.\S+/;

    if (!form.email || !form.password) {
      return setError('Please fill in all fields.');
    }
    if (!emailRegex.test(form.email)) {
      return setError('Please enter a valid email address.');
    }

    try {
    const res = await apiFetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Login failed.');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess('Login successful!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }} className="p-4 shadow-sm">
        <Card.Body>
          <h2 className="text-center mb-4 text-brown">Login</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
              />
            </Form.Group>

            <Button type="submit" className="w-100 bg-brown border-0">
              Login
            </Button>
          </Form>

          <p className="text-center mt-3">
            Don't have an account?{' '}
            <span style={{ color: '#623E2A', cursor: 'pointer' }} onClick={() => navigate('/register')}>
              Register
            </span>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
