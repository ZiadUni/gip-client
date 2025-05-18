// TicketBooking.jsx - Displays all available events for booking
// Map through static or fetched list of events

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { apiFetch } from '../utils/api';

const TicketBooking = () => {
  const [eventBookings, setEventBookings] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch('/bookings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          const venueBookings = data.filter(b =>
            b.type === 'venue' &&
            b.status === 'confirmed' &&
            b.details?.event &&
            b.details?.date &&
            b.details?.name
          );
          setEventBookings(venueBookings);
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
  const fetchAvailability = async () => {
    const availabilityData = {};

    for (const booking of eventBookings) {
      const id = `${booking.details.name}__${booking.details.date}__${booking.details.time}`;
      try {
        const res = await apiFetch(`/availability/event/${encodeURIComponent(id)}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data.seats)) {
          const booked = data.seats.filter(s => s.status === 'booked').length;
          const capacity = data.seats.length;
          availabilityData[booking._id] = { booked, capacity };
        }
      } catch (err) {
        console.warn('Availability check failed for', booking.details.event);
      }
    }

    setAvailabilityMap(availabilityData);
  };

  if (eventBookings.length > 0) {
    fetchAvailability();
  }
}, [eventBookings]);

  const handleBook = (eventDetails) => {
    navigate('/live-booking', { state: { event: eventDetails } });
  };

  const formatTimeRange = (timeStringOrArray) => {
    const slots = Array.isArray(timeStringOrArray)
      ? timeStringOrArray
      : timeStringOrArray?.split(' - ') || [];

    if (slots.length <= 1) return timeStringOrArray;
    return `${slots[0]} - ${slots[slots.length - 1]}`;
  };

  return (
    <div className="fade-in">
      <Container className="py-5">
      <div className="d-flex justify-content-start mb-3">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>
      </div>
        <h2 className="text-center text-brown mb-4">Available Events</h2>

        {eventBookings.length === 0 ? (
          <p className="text-center text-muted">No events available.</p>
        ) : (
          <Row className="g-4">
            {eventBookings
              .sort((a, b) => new Date(a.details.date) - new Date(b.details.date))
              .map((b, idx) => (
                <Col md={6} lg={4} key={b._id || idx}>
                  <Card className="h-100 shadow-sm">
                    {b.details.image && (
                      <Card.Img
                        variant="top"
                        src={b.details.image}
                        alt={b.details.event}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{b.details.event}</Card.Title>
                      <Card.Text><strong>Date:</strong> {b.details.date}</Card.Text>
                      <Card.Text><strong>Time:</strong> {formatTimeRange(b.details.time)}</Card.Text>
                      <Card.Text><strong>Venue:</strong> {b.details.name}</Card.Text>
                      <Card.Text>
                        <strong>Availability Status:</strong>{' '}
                        {availabilityMap[b._id] ? (
                          <span className={
                            availabilityMap[b._id].booked >= availabilityMap[b._id].capacity
                              ? 'text-danger'
                              : 'text-success'
                          }>
                            {availabilityMap[b._id].booked >= availabilityMap[b._id].capacity
                              ? 'Fully Booked'
                              : 'Available'}
                          </span>
                        ) : (
                          <span className="text-muted">Loading...</span>
                        )}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <Button
                        className="w-100 bg-brown border-0"
                        onClick={() => handleBook(b.details)}
                      >
                        Book Now
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default TicketBooking;
