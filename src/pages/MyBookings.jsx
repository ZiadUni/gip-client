// MyBookings.jsx - Displays current and past bookings for the user
// Filter bookings by status or sort by date
// Send DELETE request to cancel a booking

import React, { useEffect, useState } from 'react';
import {
  Container, Card, Row, Col, Alert, Button, Form, Tabs, Tab, Badge
} from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal';
import CancelReasonModal from '../components/CancelReasonModal';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [activeTab, setActiveTab] = useState('event');
  const [availabilityStatus, setAvailabilityStatus] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackBookingId, setFeedbackBookingId] = useState(null);
  const navigate = useNavigate();
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      fetchAvailabilityStatuses(bookings);
    }
  }, [bookings]);

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

  const fetchAvailabilityStatuses = async (bookings) => {
    const token = localStorage.getItem('token');
    const statusMap = {};

    await Promise.all(bookings.map(async (b) => {
      try {
        if (b.type === 'event') {
          const id = `${b.details?.venue}__${b.details?.date}__${b.details?.time}`;
          const res = await apiFetch(`/availability/event/${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          const seat = b.details?.seat;
          const available = data.seats?.some(s => s.id === seat && s.status === 'available');
          statusMap[b._id] = available ? 'available' : 'unavailable';
        } else if (b.type === 'venue') {
          const id = `${b.details?.name}__${b.details?.date}`;
          const res = await apiFetch(`/availability/venue/${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          const slot = b.details?.time;
          const available = data.slots?.some(s => s.time === slot && s.status === 'available');
          statusMap[b._id] = available ? 'available' : 'unavailable';
        }
      } catch (err) {
        console.warn('Availability check failed:', err);
        statusMap[b._id] = 'unknown';
      }
    }));

    setAvailabilityStatus(statusMap);
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
    setCancelBookingId(id);
    setShowCancelReason(true);
    fetchBookings();
  } catch (err) {
    setError(err.message);
  }
};

  const handleOpenFeedback = (bookingId) => {
    setFeedbackBookingId(bookingId);
    setShowFeedback(true);
  };

  const renderCard = (booking, index) => {
    const status = availabilityStatus[booking._id];
    const badge =
      status === 'available' ? <Badge bg="success">✅ Available</Badge> :
      status === 'unavailable' ? <Badge bg="danger">❌ Unavailable</Badge> :
      <Badge bg="secondary">⏳ Checking...</Badge>;

    return (
      <Col md={6} lg={4} key={index}>
        <Card className="h-100 shadow-sm">
          <Card.Body>
            <Card.Title className="text-capitalize d-flex justify-content-between align-items-center">
              {booking.type === 'event' ? '🎟️ Event Booking' : '🏢 Venue Booking'}
              {badge}
            </Card.Title>
            <Card.Text><strong>Status:</strong> {booking.status}</Card.Text>
            <Card.Text><strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleString()}</Card.Text>

            {booking.type === 'event' && booking.details && (
              <>
                <Card.Text><strong>Event:</strong> {booking.details.title}</Card.Text>
                <Card.Text><strong>Seats:</strong> {booking.details.seats?.join(', ') || booking.details.seat}</Card.Text>
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

            <div className="d-flex gap-2 mt-3 flex-wrap">
              {booking.status !== 'cancelled' && booking._id && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleCancel(booking._id)}
                >
                  Cancel Booking
                </Button>
              )}
              {booking.status === 'confirmed' && (
                <Button
                  className="bg-brown"
                  size="sm"
                  onClick={() => handleOpenFeedback(booking._id)}
                >
                  Leave Feedback
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  const getFilteredBookings = (type) => {
    return bookings
      .filter(b =>
        b.type === type &&
        (filter === 'all' || b.status === filter)
      )
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortNewestFirst ? timeB - timeA : timeA - timeB;
      });
  };

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
            <option value="all">All Statuses</option>
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

      <Tabs
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key)}
        className="mb-3 justify-content-center custom-tabs"
        fill
      >
        <Tab eventKey="event" title="🎟 Event Bookings">
          <Row className="g-4">
            {getFilteredBookings('event').map(renderCard)}
          </Row>
        </Tab>
        <Tab eventKey="venue" title="🏛 Venue Bookings">
          <Row className="g-4">
            {getFilteredBookings('venue').map(renderCard)}
          </Row>
        </Tab>
      </Tabs>

      <FeedbackModal
        show={showFeedback}
        onClose={() => setShowFeedback(false)}
        bookingId={feedbackBookingId}
        onSubmitted={fetchBookings}
      />
      <CancelReasonModal
        show={showCancelReason}
        onClose={() => setShowCancelReason(false)}
        bookingId={cancelBookingId}
        onSubmitted={fetchBookings}
      />

    </Container>
  );
};

export default MyBookings;
