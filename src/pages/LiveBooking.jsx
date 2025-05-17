// LiveBooking.jsx - Live seat booking interface for events
// Poll seat availability every few seconds
// Handle click to select/unselect seat

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Button, Badge, Alert } from 'react-bootstrap';
import { apiFetch } from '../utils/api';

const LiveBooking = () => {
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [mySeats, setMySeats] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const selectedEvent = location.state?.event;

  useEffect(() => {
    if (!location.state?.event) {
      navigate('/ticket-booking');
  }
    const fetchAvailability = async () => {
      if (!selectedEvent?.id) return;
      const token = localStorage.getItem('token');

      try {
        const [resAvail, resMyBookings] = await Promise.all([
          apiFetch(`/availability/event/${selectedEvent.id}`),
          apiFetch('/bookings', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const availability = await resAvail.json();
        const bookings = await resMyBookings.json();

        setSeats(availability.seats || []);

        const match = bookings.find(
          b => b.itemId === selectedEvent.id && b.status === 'confirmed'
        );
        if (match) setMySeats(match.details.seats || []);
      } catch (err) {
        console.error('Fetch availability error:', err);
      }
    };

    fetchAvailability();
    const interval = setInterval(fetchAvailability, 4000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  const handleSelect = seat => {
    if (seat.status !== 'available') return;
    setSelected(prev =>
      prev.includes(seat.id)
        ? prev.filter(id => id !== seat.id)
        : [...prev, seat.id]
    );
  };

  const getVariant = (status, isSelected, seatId) => {
    if (mySeats.includes(seatId)) return 'success';
    if (isSelected) return 'success';
    if (status === 'booked') return 'danger';
    if (status === 'pending') return 'info';
    return 'secondary';
  };

  const handleProceed = async () => {
  const selectedSeats = seats.filter(seat => selected.includes(seat.id));
  const token = localStorage.getItem('token');

  if (!selectedEvent || selectedSeats.length === 0) {
    return setError('Missing event or seat selection.');
  }

  try {
    const res = await apiFetch('/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'event',
        itemId: selectedEvent.id,
        details: {
          title: selectedEvent.title,
          date: selectedEvent.date,
          time: selectedEvent.time,
          venue: selectedEvent.venue,
          seats: selectedSeats.map(s => s.id)
        }
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Booking failed');

    setSuccess('Booking successful! Redirecting...');
    setTimeout(() => {
      navigate('/payment', { state: { type: 'event', items: selectedSeats } });
    }, 1500);
  } catch (err) {
    setError(err.message);
  }
};

const handleNotify = async (seat) => {
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
        type: 'event',
        itemId: selectedEvent.id,
        details: {
          title: selectedEvent.title,
          date: selectedEvent.date,
          time: selectedEvent.time,
          venue: selectedEvent.venue,
          seatId: seat.id
        }
      })
    });

    const data = await res.json();
    if (!res.ok && res.status !== 409) throw new Error(data.error || 'Notify failed');

    setNotifyMsg(data.message || 'Already subscribed for this seat');
  } catch (err) {
    setNotifyMsg(err.message);
  }
};

  return (
    <div className="fade-in">
      <Container className="py-5 text-center">
        <h2 className="text-brown mb-3">Live Event Booking</h2>

        {selectedEvent && (
          <div className="mb-4">
            <h5>{selectedEvent.title}</h5>
            <p><strong>Date:</strong> {selectedEvent.date}</p>
            <p><strong>Time:</strong> {selectedEvent.time}</p>
            <p><strong>Venue:</strong> {selectedEvent.venue}</p>
          </div>
        )}

        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {seats.map(seat => {
            const isSelected = selected.includes(seat.id);
            return (
              <div key={seat.id} style={{ textAlign: 'center' }}>
                <Badge
                  bg={getVariant(seat.status, isSelected, seat.id)}
                  style={{
                    padding: '12px',
                    width: '50px',
                    fontSize: '14px',
                    cursor: seat.status === 'available' ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => handleSelect(seat)}
                >
                  {seat.id}
                </Badge>
                {seat.status !== 'available' && (
                  <div>
                    <Button
                      variant="link"
                      size="sm"
                      style={{ fontSize: '12px', color: '#0d6efd' }}
                      onClick={() => handleNotify(seat)}
                    >
                      Notify Me
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {notifyMsg && <Alert variant="info">{notifyMsg}</Alert>}

        {selected.length > 0 && (
          <div>
            <p><strong>Your Seats:</strong> {selected.join(', ')}</p>
            <Button className="bg-brown border-0" onClick={handleProceed}>
              Proceed to Payment
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default LiveBooking;
