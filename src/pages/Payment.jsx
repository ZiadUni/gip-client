// Payment.jsx
// Accepts mock card input for booking confirmation and forwards the booking data to the confirmation page

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import useRouteGuard from '../hooks/useRouteGuard';

const Payment = () => {
  useRouteGuard(['items']);
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.items || [];
  const type = location.state?.type || 'event';

  const [form, setForm] = useState({
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    const { cardNumber, expiry, cvv } = form;
    if (!cardNumber || !expiry || !cvv) {
      setError('Please fill out all payment details.');
      return;
    }

    navigate('/booking-confirmation', { state: { type, items: booking } });
  };

  return (
    <div className="fade-in">
      <Container className="py-5" style={{ maxWidth: '600px' }}>
        <Card className="p-4 shadow-sm">
          <h3 className="text-center text-brown mb-4">Payment</h3>

          <h6>Booking Summary:</h6>
          <ul>
            {booking.map((item, idx) => (
              <li key={idx}>
                {type === 'event' ? (
                  `Seat #${item.seat}`
                ) : (
                  <>
                    <strong>{item.name}</strong><br />
                    Date: {item.date} <br />
                    Time: {item.time} <br />
                    Price: {item.price || 'N/A'}
                  </>
                )}
              </li>
            ))}
          </ul>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit} className="mt-3">
            <Form.Group className="mb-3">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="text"
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>CVV</Form.Label>
              <Form.Control
                type="password"
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                placeholder="123"
              />
            </Form.Group>
            <Button type="submit" className="w-100 bg-brown border-0">
              Confirm Payment
            </Button>
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default Payment;
