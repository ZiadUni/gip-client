// VenueBooking.jsx - Lists venues for booking, each links to slot selection
// Redirects visitors to home if accessed directly

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../utils/api';

const VenueBooking = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `GIP - ${t('titles.venueBook')}`;

    const fetchVenues = async () => {
      try {
        const res = await apiFetch('/venues');
        const data = await res.json();
        setVenues(data);
      } catch (err) {
        console.error('Failed to fetch venues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [t]);

  const handleBookNow = (venue) => {
    navigate('/venuelivebooking', { state: { venue } });
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>{t('venueBooking.loading')}</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-start text-brown">{t('venueBooking.title')}</h2>
      <Row className="g-4">
        {venues.map((venue) => (
          <Col key={venue._id} xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Img
                variant="top"
                src={venue.image}
                alt={venue.name}
                style={{ maxHeight: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title className="text-brown">{venue.name}</Card.Title>
                <Card.Text>
                  <strong>{t('venueBooking.date')}:</strong> {venue.date}<br />
                  <strong>{t('venueBooking.capacity')}:</strong> {venue.capacity}<br />
                  <strong>{t('venueBooking.price')}:</strong> ${venue.price?.toString().replace(/^\$+/, '')}<br />
                  <strong>{t('venueBooking.status')}:</strong> {t(`venues.${venue.status?.toLowerCase() || 'available'}`)}
                </Card.Text>
                <Button
                  variant="primary"
                  onClick={() => handleBookNow(venue)}
                  disabled={venue.status === 'Booked'}
                >
                  {t('venueBooking.bookNow')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default VenueBooking;
