// Payment.jsx
// Accepts mock card input for booking confirmation and forwards the booking data to the confirmation page

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Modal, Spinner, InputGroup } from 'react-bootstrap';
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
  const [showCVV, setShowCVV] = useState(false);
  const [cardBrand, setCardBrand] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const totalPrice = type === 'venue' ? (booking[0]?.price?.replace('$', '') || 0) : 100;

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const detectCardBrand = (num) => {
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5')) return 'Mastercard';
    return '';
  };

    const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'cardNumber') {
      newValue = formatCardNumber(value);
      setCardBrand(detectCardBrand(newValue.replace(/\s/g, '')));
    }

    if (name === 'expiry') {
    let cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length >= 2 && cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    newValue = cleaned;
    }

    if (name === 'cvv' && /[^0-9]/.test(newValue)) return;

    setForm({ ...form, [name]: newValue });
    setError('');
  };

  const validateFields = () => {
    const { nameOnCard, cardNumber, expiry, cvv } = form;
    const cleanCard = cardNumber.replace(/\s/g, '');

    if (!nameOnCard || !cardNumber || !expiry || !cvv) return 'All fields are required.';
    if (!/^[a-zA-Z]+ [a-zA-Z]+$/.test(nameOnCard.trim())) return 'Please enter your first and last name in this format: "John Doe"';
    if (!/^\d{16}$/.test(cleanCard)) return 'Card number must be 16 digits.';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Expiry must be in MM/YY format.';
    if (!/^\d{3}$/.test(cvv)) return 'CVV must be 3 digits.';

    const [mm, yy] = expiry.split('/').map(Number);
    if (mm < 1 || mm > 12) return 'Expiry month must be between 01 and 12.';
    if (yy < 0 || yy > 99) return 'Invalid year format. Use two-digit year (e.g., 25 for 2025).';

    const expDate = new Date(2000 + yy, mm - 1, 1);
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (expDate < currentMonth) return 'Card is expired.';
    if (cleanCard === '4000000000000002') return 'Card was declined.';
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
        body: JSON.stringify({
          type,
          itemId: type === 'event'
            ? `${booking[0].name}__${booking[0].date}__${booking[0].time}`
            : booking[0]._id,
          details: { ...booking[0] }
        })
      });

      const data = await res.json();
      if (res.status === 409) return setError(data.error || 'Seat or slot already reserved.');
      if (!res.ok) throw new Error(data.error || 'Booking failed.');

      const confirmRes = await apiFetch(`/bookings/${data.booking._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });

      if (!confirmRes.ok) throw new Error('Failed to confirm booking.');

      setTimeout(() => {
        navigate('/booking-confirmation', { state: { type, items: booking } });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setShowModal(false);
    }
  };
  
      const getValidationClass = (name, value) => {
        if (!value) return '';
        switch (name) {
          case 'nameOnCard':
            return /^[a-zA-Z]+ [a-zA-Z]+$/.test(value.trim()) ? 'is-valid' : 'is-invalid';
          case 'cardNumber':
            return /^\d{4} \d{4} \d{4} \d{4}$/.test(value) ? 'is-valid' : 'is-invalid';
          case 'expiry':
            return /^\d{2}\/\d{2}$/.test(value) ? 'is-valid' : 'is-invalid';
          case 'cvv':
            return /^\d{3}$/.test(value) ? 'is-valid' : 'is-invalid';
          default:
            return '';
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
                {type === 'event'
                  ? `Seat #${item.seat}`
                  : (
                    <>
                      <strong>{item.name}</strong><br />
                      Date: {item.date} <br />
                      Time: {item.time} <br />
                      Price: ${String(item.price || '').replace('$', '')}
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
                className={getValidationClass('nameOnCard', form.nameOnCard)}
                type="text"
                name="nameOnCard"
                value={form.nameOnCard}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Card Number {cardBrand && <small>({cardBrand})</small>}</Form.Label>
              <Form.Control
                className={getValidationClass('cardNumber', form.cardNumber)}
                type="text"
                name="cardNumber"
                value={form.cardNumber}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.name === 'cardNumber' && e.target.value.replace(/\s/g, '').length === 16) {
                    document.querySelector('input[name="expiry"]').focus();
                  }
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expiry (MM/YY)</Form.Label>
              <Form.Control
                className={getValidationClass('expiry', form.expiry)}
                type="text"
                name="expiry"
                value={form.expiry}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.name === 'expiry' && e.target.value.length === 5) {
                    document.querySelector('input[name="cvv"]').focus();
                  }
                }}
                placeholder="MM/YY"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>CVV</Form.Label>
              <InputGroup>
                <Form.Control
                  className={getValidationClass('cvv', form.cvv)}
                  type={showCVV ? "text" : "password"}
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength={3}
                />
                <Button variant="outline-secondary" onClick={() => setShowCVV(!showCVV)}>
                  {showCVV ? 'Hide' : 'Show'}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button type="submit" className="w-100 bg-brown border-0" disabled={submitting}>
              {submitting ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </Form>
        </Card>
      </Container>

      <Modal show={showModal} centered backdrop="static">
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" className="mb-3" />
          <h5>Processing Payment...</h5>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Payment;
