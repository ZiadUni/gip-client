// VenueBooking.jsx - Lists venues for booking, each links to slot selection
// Redirects visitors to home if accessed directly

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { apiFetch } from '../utils/api';

const VenueBooking = () => {
  const [venues, setVenues] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role === 'visitor') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch('/venues', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          setVenues(data);
        }
      } catch (err) {
        console.error('Failed to fetch venues:', err);
      }
    };

    fetchVenues();
  }, []);

  const handleBook = (slot) => {
    navigate('/VenueLiveBooking', { state: { slot } });
  };

  return (
    <div className="fade-in">
          <Button
      variant="secondary"
      onClick={() => navigate(-1)}
      className="mb-3"
    >
      ← Back
    </Button>
      <Container className="py-5">
        <h2 className="text-center text-brown mb-4">Available Venues</h2>
        <Row className="g-4">
          {venues
            .filter(v => v.availability?.toLowerCase().trim() === 'available')
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(slot => (
              <Col md={6} lg={4} key={slot._id}>
                <Card className="h-100 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={slot.image}
                    alt={slot.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{slot.name}</Card.Title>
                    <Card.Text><strong>Date:</strong> {new Date(slot.date).toLocaleDateString('en-GB')}</Card.Text>
                    <Card.Text><strong>Capacity:</strong> {slot.capacity} People</Card.Text>
                    <Card.Text>
                      <strong>Booking Status:</strong>{' '}
                      <span className={slot.status === 'Available' ? 'text-success' : 'text-danger'}>
                        {slot.status}
                      </span>
                    </Card.Text>
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

          {venues.filter(v => v.availability === 'Available').length === 0 && (
            <Col>
              <p className="text-center text-muted">No venues available.</p>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default VenueBooking;
