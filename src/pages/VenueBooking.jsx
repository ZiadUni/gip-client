// VenueBooking.jsx - Lists venues for booking, each links to slot selection
// Redirects visitors to home if accessed directly

import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../index.css';

function VenueBooking() {
  const [venues, setVenues] = useState([]);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const lang = i18n.language || 'en';
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/venues?lang=${lang}`);
        const data = await response.json();

        setVenues(data);
      } catch (error) {
        console.error('Failed to fetch venues:', error);
      }
    };

    fetchVenues();
  }, [i18n.language]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'green';
      case 'Booked':
        return 'red';
      case 'Unavailable':
      default:
        return 'gray';
    }
  };

  return (
    <div className="page-container">
      <h2 className="text-center mb-4">{t('venues.title')}</h2>
      <div className="d-flex flex-wrap justify-content-center">
        {venues.length === 0 ? (
          <p>{t('venues.noVenues')}</p>
        ) : (
          venues.map((venue) => (
            <Card key={venue._id} className="m-3 venue-card">
              <Card.Img variant="top" src={venue.image} alt={venue.name} />
              <Card.Body>
                <Card.Title>{venue.name}</Card.Title>
                <Card.Text>
                  {t('venues.cardDate')} {venue.date}<br />
                  {t('venues.cardCapacity')} {venue.capacity} {t('venues.people')}<br />
                  {t('venues.cardPrice')} ${venue.price}<br />
                  {t('venues.cardStatus')} <span style={{ color: getStatusColor(venue.status), fontWeight: 'bold' }}>
                    {t(`venues.status.${venue.status}`)}
                  </span>
                </Card.Text>
                <Button
                  variant="primary"
                  disabled={venue.status !== 'Available'}
                  onClick={() => navigate(`/venue-booking/${venue._id}`)}
                >
                  {t('venues.bookButton')}
                </Button>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default VenueBooking;
