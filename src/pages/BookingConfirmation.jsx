// BookingConfirmation.jsx - Displays a summary after successful booking/payment
// Renders user’s booking data passed via router

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import useRouteGuard from '../hooks/useRouteGuard';

const BookingConfirmation = () => {
  useRouteGuard(['items']);
  const location = useLocation();
  const navigate = useNavigate();
  const type = location.state?.type || 'event';
  const booking = location.state?.items || [];

  const handleGoBack = () => {
    if (type === 'event') navigate('/ticket-booking');
    else navigate('/venue-booking');
  };

  return (
    <div className="fade-in">
      <Container className="py-5" style={{ maxWidth: '700px' }}>
        <Card className="p-4 shadow-sm">
          <h3 className="text-center text-success mb-4">Booking Confirmed ✅</h3>

          <h5>Confirmation Summary:</h5>
          <ul>
            {booking.map((item, idx) => (
              <li key={idx} className="mb-2">
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

          <div className="text-center mt-4">
            <Button variant="outline-success" onClick={handleGoBack}>
              Book Another {type === 'event' ? 'Ticket' : 'Venue'}
            </Button>
            <Button
              variant="outline-secondary"
              className="ms-2"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default BookingConfirmation;
