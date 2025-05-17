// VenueBooking.jsx - Lists venues for booking, each links to slot selection
// Redirects visitors to home if accessed directly

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';

const mockVenueSlots = [
  {
    id: "slot-1",
    name: "Conference Hall",
    date: "2025-05-10",
    capacity: 200,
    availability: "9:00 AM to 9:00 PM",
    status: "Available",
    price: "$700",
    image: "https://i.imgur.com/rZAPLJt.jpeg"
  },
  {
    id: "slot-2",
    name: "Innovation Lab",
    date: "2025-05-11",
    capacity: 50,
    availability: "24/7 Access with prior booking",
    status: "Available",
    price: "$500",
    image: "https://i.imgur.com/GbmML9Y.jpeg"
  },
  {
    id: "slot-3",
    name: "Co-Working Space",
    date: "2025-05-12",
    capacity: 30,
    availability: "8:00 AM to 8:00 PM",
    status: "Available",
    price: "$300",
    image: "https://i.imgur.com/QVyNa1a.jpeg"
  }
];

const VenueBooking = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'visitor') {
        navigate('/');
      }
    }, [user, navigate]);

  const handleBook = (slot) => {
    navigate('/VenueLiveBooking', { state: { slot } });
  };

  return (
    <div className="fade-in">
      <Container className="py-5">
        <h2 className="text-center text-brown mb-4">Available Venues</h2>
        <Row className="g-4">
          {mockVenueSlots.map(slot => (
            <Col md={6} lg={4} key={slot.id}>
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={slot.image}
                  alt={slot.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title>{slot.name}</Card.Title>
                  <Card.Text><strong>Date:</strong> {slot.date}</Card.Text>
                  <Card.Text><strong>Capacity:</strong> {slot.capacity} People</Card.Text>
                  <Card.Text><strong>Availability:</strong> {slot.availability}</Card.Text>
                  <Card.Text><strong>Status:</strong> {slot.status}</Card.Text>
                  <Card.Text><strong>Price:</strong> {slot.price}</Card.Text>
                </Card.Body>
                <Card.Footer>
                  <Button
                    className="w-100 bg-brown border-0"
                    onClick={() => handleBook(slot)}
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

export default VenueBooking;
