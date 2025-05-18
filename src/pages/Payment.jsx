// Payment.jsx
// Accepts mock card input for booking confirmation and forwards the booking data to the confirmation page

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import useRouteGuard from '../hooks/useRouteGuard';

const Payment = () => {
  useRouteGuard(['items']);
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.items || [];
  const type = location.state?.type || 'event';
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { cardNumber, expiry, cvv } = form;
    if (!cardNumber || !expiry || !cvv) {
      return setError('Please fill out all payment details.');
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(
          type === 'event'
            ? {
                type: 'event',
                itemId: `${booking[0].name}__${booking[0].date}__${booking[0].time}`,
                details: { ...booking[0] }
              }
            : {
                type: 'venue',
                itemId: booking[0]._id,
                details: {
                  name: booking[0].name,
                  date: booking[0].date,
                  time: booking[0].time,
                  event: booking[0].event,
                  price: booking[0].price,
                  image: booking[0].image,
                  capacity: booking[0].capacity,
                  availability: booking[0].availability,
                  slots: booking[0].slots
                }
              }
        )
      });

      const data = await res.json();

      if (res.status === 409) {
        return setError(data.error || 'This seat or slot is already reserved.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      const bookingId = data.booking._id;
      const confirmRes = await apiFetch(`/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });

      if (!confirmRes.ok) {
        const confirmData = await confirmRes.json();
        throw new Error(confirmData.error || 'Failed to confirm booking.');
      }

      navigate('/booking-confirmation', { state: { type, items: booking } });
    } catch (err) {
      setError(err.message || 'Something went wrong during booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-start mb-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
      </div>

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

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

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
            <Button type="submit" className="w-100 bg-brown border-0" disabled={submitting}>
              {submitting ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default Payment;
