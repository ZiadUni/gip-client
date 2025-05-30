// VenueBooking.jsx - Lists venues for booking, each links to slot selection
// Redirects visitors to home if accessed directly

// pages/VenueBooking.jsx

import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const VenueBooking = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events/public');
        const data = await res.json();

        const grouped = {};

        data.forEach((booking) => {
          const key = booking.details.event;
          if (!grouped[key]) {
            grouped[key] = {
              event: key,
              venue: booking.details.name,
              date: booking.details.date,
              slots: new Set()
            };
          }

          if (Array.isArray(booking.details.slots)) {
            booking.details.slots.forEach((slot) => grouped[key].slots.add(slot));
          } else {
            grouped[key].slots.add(booking.details.time);
          }
        });

        setEvents(Object.values(grouped).map((e) => ({
          ...e,
          slots: Array.from(e.slots)
        })));
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatTimeRange = (slots) => {
    const times = slots
      .map((slot) => slot.split(' - '))
      .flat()
      .sort((a, b) => new Date(`1970/01/01 ${a}`) - new Date(`1970/01/01 ${b}`));
    return `${times[0]} - ${times[times.length - 1]}`;
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">{t('venueBook.title')}</h2>

      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-center">{t('venueBook.noVenues')}</p>
      ) : (
        <Row>
          {events.map((event, idx) => (
            <Col key={idx} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Img
                  variant="top"
                  src="https://via.placeholder.com/400x200?text=Event"
                  style={{ objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{event.event}</Card.Title>
                  <Card.Text>
                    <strong>{t('venueBook.date')}:</strong> {event.date}
                    <br />
                    <strong>{t('venueBook.time')}:</strong> {formatTimeRange(event.slots)}
                    <br />
                    <strong>{t('venueBook.venue')}:</strong> {event.venue}
                  </Card.Text>
                  <Button
                    variant="primary"
                    className="mt-auto"
                    onClick={() => navigate(`/live-booking/${event.event}`)}
                  >
                    {t('tickets.bookButton')}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default VenueBooking;
