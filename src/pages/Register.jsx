// Register.jsx - Handles user registration form and validation
// Includes optional checkbox for requesting organizer role

import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    wantsToBeOrganizer: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const checkStrength = password => {
    if (password.length < 6) return { label: 'Weak', variant: 'danger', now: 33 };
    if (password.length < 10) return { label: 'Medium', variant: 'warning', now: 66 };
    return { label: 'Strong', variant: 'success', now: 100 };
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const emailRegex = /\S+@\S+\.\S+/;

    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError('Please fill in all fields.');
    }
    if (!emailRegex.test(form.email)) {
      return setError('Please enter a valid email address.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }

    try {
      const res = await apiFetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          wantsToBeOrganizer: form.wantsToBeOrganizer
        })
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Registration failed.');

      setSuccess('Registered successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  const strength = checkStrength(form.password);
  const showStrength = form.password.length > 0;
  const showLiveMismatch = form.confirm.length > 0 && form.confirm !== form.password;

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '450px' }} className="p-4 shadow-sm">
        <Card.Body>
          <h2 className="text-center mb-4 text-brown">Register</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </Form.Group>

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

            <Form.Group className="mb-2" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
              />
            </Form.Group>

            {showStrength && (
              <ProgressBar
                striped
                animated
                now={strength.now}
                variant={strength.variant}
                label={strength.label}
                className="mb-3"
              />
            )}

            <Form.Group className="mb-2" controlId="confirm">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Re-type password"
                isInvalid={showLiveMismatch}
              />
              {showLiveMismatch && (
                <Form.Text className="text-danger">
                  Passwords do not match.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="wantsToBeOrganizer">
              <Form.Check
                type="checkbox"
                label="I want to register as an organizer"
                name="wantsToBeOrganizer"
                checked={form.wantsToBeOrganizer}
                onChange={e =>
                  setForm({ ...form, wantsToBeOrganizer: e.target.checked })
                }
              />
            </Form.Group>

            <Button type="submit" className="w-100 bg-brown border-0 mt-2">
              Register
            </Button>
          </Form>

          <p className="text-center mt-3">
            Already have an account?{' '}
            <span
              style={{ color: '#623E2A', cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >
              Login
            </span>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
