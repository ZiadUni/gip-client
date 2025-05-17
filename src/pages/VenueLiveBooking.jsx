// VenueLiveBooking.jsx - Real-time time slot booking for venues
// Polls backend for latest slot availability
// Sends selected slot to booking API

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { apiFetch } from '../utils/api';

const VenueLiveBooking = () => {
  const [slots, setSlots] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mySlotTimes, setMySlotTimes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const selectedVenue = location.state?.slot;

  useEffect(() => {
      if (user.role === 'visitor') {
      navigate('/');
    }
    const fetchAvailability = async () => {
      if (!selectedVenue?.name || !selectedVenue?.date) return;
      const token = localStorage.getItem('token');
      const itemId = encodeURIComponent(`${selectedVenue.name}__${selectedVenue.date}`);

      try {
        const [resAvail, resMyBookings] = await Promise.all([
          apiFetch(`/availability/venue/${itemId}`),
          apiFetch('/bookings', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const availability = await resAvail.json();
        const bookings = await resMyBookings.json();

        setSlots(availability.slots || []);

        const match = bookings.find(
          b => b.itemId === `${selectedVenue.name}__${selectedVenue.date}` && b.status === 'confirmed'
        );
        if (match) setMySlotTimes([match.details.time]);
      } catch (err) {
        console.error('Fetch availability error:', err);
      }
    };

    fetchAvailability();
    const interval = setInterval(fetchAvailability, 4000);
    return () => clearInterval(interval);
  }, [selectedVenue]);

  const handleClick = slot => {
    if (slot.status !== 'available') return;
    setSelectedId(slot.id === selectedId ? null : slot.id);
    setError('');
    setSuccess('');
  };

  const handleProceed = async () => {
    const slot = slots.find(s => s.id === selectedId);
    const token = localStorage.getItem('token');

    if (!slot || !selectedVenue) {
      return setError('Missing slot or venue details.');
    }

    try {
      const res = await apiFetch('/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'venue',
          itemId: `${selectedVenue.name}__${selectedVenue.date}`,
          details: {
            name: selectedVenue.name,
            date: selectedVenue.date,
            time: slot.time,
            price: selectedVenue.price,
            image: selectedVenue.image,
            capacity: selectedVenue.capacity,
            availability: selectedVenue.availability
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      setSuccess('Venue booked! Redirecting to payment...');
      setTimeout(() => {
        navigate('/payment', {
          state: {
            type: 'venue',
            items: [{
              ...slot,
              ...selectedVenue
            }]
          }
        });
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNotify = async slot => {
    const token = localStorage.getItem('token');
    setNotifyMsg('');

    try {
      const res = await apiFetch('/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'venue',
          itemId: `${selectedVenue.name}__${selectedVenue.date}`,
          details: {
            name: selectedVenue?.name,
            date: selectedVenue?.date,
            time: slot.time
          }
        })
      });

      const data = await res.json();
      if (!res.ok && res.status !== 409) throw new Error(data.error || 'Notify failed');

      setNotifyMsg(data.message || 'Already subscribed for this slot');
    } catch (err) {
      setNotifyMsg(err.message);
    }
  };

  const getColor = (status, isSelected, time) => {
    if (mySlotTimes.includes(time)) return '#198754'; // green
    if (isSelected) return '#198754';
    if (status === 'booked') return '#dc3545';
    if (status === 'pending') return '#0dcaf0';
    return '#adb5bd';
  };

  return (
    <div className="fade-in">
      <Container className="py-5 text-center">
        <h2 className="text-brown mb-3">Live Venue Slot Booking</h2>
        {selectedVenue && (
          <div className="mb-4">
            <h5>{selectedVenue.name}</h5>
            <p><strong>Date:</strong> {selectedVenue.date}</p>
            <p><strong>Capacity:</strong> {selectedVenue.capacity}</p>
            <p><strong>Availability:</strong> {selectedVenue.availability}</p>
            <p><strong>Price:</strong> {selectedVenue.price}</p>
          </div>
        )}

        <Row className="g-4 justify-content-center">
          {slots.map(slot => {
            const isSelected = selectedId === slot.id;
            return (
              <Col sm={6} md={4} key={slot.id}>
                <Card
                  style={{
                    backgroundColor: getColor(slot.status, isSelected, slot.time),
                    color: '#fff',
                    cursor: slot.status === 'available' ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => handleClick(slot)}
                >
                  <Card.Body>
                    <Card.Title>{slot.time}</Card.Title>
                    <Card.Text>Status: {slot.status}</Card.Text>
                    {slot.status !== 'available' && (
                      <Button
                        variant="light"
                        size="sm"
                        className="mt-2"
                        onClick={e => {
                          e.stopPropagation();
                          handleNotify(slot);
                        }}
                      >
                        Notify Me
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
        {success && <Alert variant="success" className="mt-4">{success}</Alert>}
        {notifyMsg && <Alert variant="info" className="mt-4">{notifyMsg}</Alert>}

        {selectedId && (
          <div className="mt-4">
            <p><strong>Selected Slot:</strong> {slots.find(slot => slot.id === selectedId)?.time}</p>
            <Button className="bg-brown border-0" onClick={handleProceed}>
              Proceed to Payment
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default VenueLiveBooking;
