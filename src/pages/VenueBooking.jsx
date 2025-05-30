// VenueBooking.jsx - Lists venues for booking, each links to slot selection
// Redirects visitors to home if accessed directly

// pages/VenueBooking.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const VenueBooking = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const fetchVenues = async () => {
    try {
      const lang = i18n.language || 'en';
      const response = await fetch(`/api/venues?lang=${lang}`);
      const data = await response.json();
      setVenues(data);
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [i18n.language]);

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">{t('venueBook.title')}</h2>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : venues.length === 0 ? (
        <p className="text-center">{t('venueBook.noVenues')}</p>
      ) : (
        <Row>
          {venues.map((venue) => (
            <Col key={venue._id} sm={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow">
                <Card.Img
                  variant="top"
                  src={venue.image}
                  alt={venue.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{venue.name}</Card.Title>
                  <Card.Text>
                    <strong>{t('venueBook.date')}:</strong> {venue.date}
                    <br />
                    <strong>{t('venueBook.capacity')}:</strong> {venue.capacity}
                    <br />
                    <strong>{t('venueBook.price')}:</strong> {venue.price}
                    <br />
                    <strong>{t('venueBook.status')}:</strong> {t(`venueMgmt.status.${venue.status}`)}
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/venuelivebooking/${venue._id}`)}
                    className="mt-auto"
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
