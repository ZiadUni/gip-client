// TicketBooking.jsx - Displays all available events for booking
// Map through static or fetched list of events

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { apiFetch } from '../utils/api';

const TicketBooking = () => {
  const [eventBookings, setEventBookings] = useState([]);
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
            b.details?.event
          );
          setEventBookings(venueBookings);
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    fetchBookings();
  }, []);

  const groupedEvents = eventBookings.reduce((groups, booking) => {
    const key = booking.details.event;
    if (!groups[key]) groups[key] = [];
    groups[key].push(booking);
    return groups;
  }, {});

  const handleBook = (eventDetails) => {
    navigate('/live-booking', { state: { event: eventDetails } });
  };

  return (
    <div className="fade-in">
      <Container className="py-5">
        <h2 className="text-center text-brown mb-4">Available Events</h2>

        {Object.entries(groupedEvents).length === 0 ? (
          <p className="text-center text-muted">No events available.</p>
        ) : (
          Object.entries(groupedEvents).map(([eventName, bookings]) => (
            <div key={eventName} className="mb-5">
              <h4 className="text-center mb-3">{eventName}</h4>
              <Row className="g-4">
                {eventBookings
                  .sort((a, b) => new Date(a.details.date) - new Date(b.details.date))
                  .map((b, idx) => (
                    <Col md={6} lg={4} key={b._id || idx}>
                      <Card className="h-100 shadow-sm">
                        <Card.Body>
                          <Card.Title>{b.details.event}</Card.Title>
                          <Card.Text><strong>Date:</strong> {b.details.date}</Card.Text>
                          <Card.Text><strong>Time:</strong> {b.details.time}</Card.Text>
                          <Card.Text><strong>Venue:</strong> {b.details.name}</Card.Text>
                        </Card.Body>
                        <Card.Footer>
                          <Button
                            className="w-100 bg-brown border-0"
                            onClick={() => navigate('/live-booking', { state: { event: b.details } })}
                          >
                            Book Now
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
              </Row>

            </div>
          ))
        )}
      </Container>
    </div>
  );
};

export default TicketBooking;
