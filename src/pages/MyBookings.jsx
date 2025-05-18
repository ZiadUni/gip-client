// MyBookings.jsx - Displays current and past bookings for the user
// Filter bookings by status or sort by date
// Send DELETE request to cancel a booking

import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Alert, Button, Form } from 'react-bootstrap';
import { apiFetch } from '../utils/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await apiFetch('/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings');

      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async id => {
    const token = localStorage.getItem('token');
    const confirm = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirm) return;

    try {
      const res = await apiFetch(`/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancel failed');

      setSuccess('Booking cancelled');
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderCard = (booking, index) => (
    <Col md={6} lg={4} key={index}>
      <Card className="h-100 shadow-sm">
        <Card.Body>
          <Card.Title className="text-capitalize">
            {booking.type === 'event' ? '🎟️ Event Booking' : '🏢 Venue Booking'}
          </Card.Title>
          <Card.Text><strong>Status:</strong> {booking.status}</Card.Text>
          <Card.Text><strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleString()}</Card.Text>

          {booking.type === 'event' && booking.details && (
            <>
              <Card.Text><strong>Event:</strong> {booking.details.title}</Card.Text>
              <Card.Text><strong>Seats:</strong> {booking.details.seats?.join(', ')}</Card.Text>
              <Card.Text><strong>Date:</strong> {booking.details.date}</Card.Text>
              <Card.Text><strong>Time:</strong> {booking.details.time}</Card.Text>
              <Card.Text><strong>Venue:</strong> {booking.details.venue}</Card.Text>
            </>
          )}

          {booking.type === 'venue' && booking.details && (
            <>
              <Card.Text><strong>Venue:</strong> {booking.details.name}</Card.Text>
              <Card.Text><strong>Date:</strong> {booking.details.date}</Card.Text>
              <Card.Text><strong>Time:</strong> {booking.details.time}</Card.Text>
            </>
          )}

          {booking.status !== 'cancelled' && booking._id && (
            <Button
              variant="outline-danger"
              size="sm"
              className="mt-3"
              onClick={() => handleCancel(booking._id)}
            >
              Cancel Booking
            </Button>
          )}
        </Card.Body>
      </Card>
    </Col>
  );

  const filteredBookings = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortNewestFirst ? timeB - timeA : timeA - timeB;
    });

  return (
    <Container className="py-5">
          <Button
      variant="secondary"
      onClick={() => navigate(-1)}
      className="mb-3"
    >
      ← Back
    </Button>
      <h2 className="text-center text-brown mb-4">📄 My Bookings</h2>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {success && <Alert variant="success" className="text-center">{success}</Alert>}
      {!error && bookings.length === 0 && <p className="text-center">No bookings yet.</p>}

      <Row className="mb-4">
        <Col md={6}>
          <Form.Select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Show All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <Button
            className="bg-brown border-0 w-100"
            onClick={() => setSortNewestFirst(!sortNewestFirst)}
          >
            Sort: {sortNewestFirst ? 'Newest First' : 'Oldest First'}
          </Button>
        </Col>
      </Row>

      <Row className="g-4">
        {filteredBookings.map(renderCard)}
      </Row>
    </Container>
  );
};

export default MyBookings;
