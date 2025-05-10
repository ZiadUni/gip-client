// TicketBooking.jsx - Displays all available events for booking
// Map through static or fetched list of events

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';

const mockEvents = [
  {
    id: "event-1",
    title: "AI & Tech Startups Conference",
    date: "2025-03-15",
    time: "10:00 AM - 4:00 PM",
    venue: "Auditorium 1"
  },
  {
    id: "event-2",
    title: "Sustainable Energy Workshop",
    date: "2025-04-20",
    time: "1:00 PM - 5:00 PM",
    venue: "Lab 2"
  },
  {
    id: "event-3",
    title: "Entrepreneurship Training Program",
    date: "2025-05-05",
    time: "9:00 AM - 2:00 PM",
    venue: "Education Hall"
  }
];

const TicketBooking = () => {
  const navigate = useNavigate();

  const handleBook = (event) => {
    navigate('/live-booking', { state: { event } });
  };

  return (
    <div className="fade-in">
      <Container className="py-5">
        <h2 className="text-center text-brown mb-4">Available Events</h2>
        <Row className="g-4">
          {mockEvents.map(event => (
            <Col md={6} lg={4} key={event.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{event.title}</Card.Title>
                  <Card.Text><strong>Date:</strong> {event.date}</Card.Text>
                  <Card.Text><strong>Time:</strong> {event.time}</Card.Text>
                  <Card.Text><strong>Venue:</strong> {event.venue}</Card.Text>
                </Card.Body>
                <Card.Footer>
                  <Button
                    className="w-100 bg-brown border-0"
                    onClick={() => handleBook(event)}
                  >
                    Book Now
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default TicketBooking;
