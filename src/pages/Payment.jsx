// Payment.jsx
// Accepts mock card input for booking confirmation and forwards the booking data to the confirmation page

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Modal, Spinner } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import useRouteGuard from '../hooks/useRouteGuard';

const Payment = () => {
  useRouteGuard(['items']);
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.items || [];
  const type = location.state?.type || 'event';
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    nameOnCard: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const totalPrice = type === 'venue' ? booking[0]?.price || 0 : 100;

  const handleChange = e => {
    const { name, value } = e.target;
    if ((name === 'cardNumber' || name === 'cvv') && /[^0-9]/.test(value)) return;
    setForm({ ...form, [name]: value });
    setError('');
  };

  const validateFields = () => {
    const { nameOnCard, cardNumber, expiry, cvv } = form;

    if (!nameOnCard || !cardNumber || !expiry || !cvv) {
      return 'Please fill in all fields.';
    }
    if (cardNumber.length !== 16) return 'Card number must be 16 digits.';
    if (cvv.length !== 3) return 'CVV must be 3 digits.';

    const today = new Date();
    const [year, month] = expiry.split('-').map(Number);
    if (!year || !month) return 'Invalid expiry format.';
    const expiryDate = new Date(year, month - 1);
    if (expiryDate < today) return 'Card is expired.';

    if (cardNumber === '4000000000000002') return 'Card was declined.';
    if (cvv === '000') return 'Invalid CVV.';

    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationError = validateFields();
    if (validationError) return setError(validationError);

    setSubmitting(true);
    setShowModal(true);

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
                details: { ...booking[0] }
              }
        )
      });

      const data = await res.json();
      if (res.status === 409) return setError(data.error || 'This seat or slot is already reserved.');
      if (!res.ok) throw new Error(data.error || 'Booking failed');

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

      setTimeout(() => {
        navigate('/booking-confirmation', { state: { type, items: booking } });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setShowModal(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <Container className="py-5" style={{ maxWidth: '600px' }}>
        <div className="d-flex justify-content-start mb-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
        </div>
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
                    Price: ${item.price || 'N/A'}
                  </>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2"><strong>Total:</strong> ${totalPrice}</p>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          <Form onSubmit={handleSubmit} className="mt-3">
            <Form.Group className="mb-3">
              <Form.Label>Name on Card</Form.Label>
              <Form.Control
                type="text"
                name="nameOnCard"
                value={form.nameOnCard}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="1234567812345678"
                maxLength={16}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="month"
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
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
                maxLength={3}
              />
            </Form.Group>
            <Button type="submit" className="w-100 bg-brown border-0" disabled={submitting}>
              {submitting ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </Form>
        </Card>
      </Container>

      <Modal show={showModal} centered backdrop="static">
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" role="status" className="mb-3" />
          <h5>Processing Payment...</h5>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Payment;
