// LiveBooking.jsx – Seat selection and booking for an event

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { apiFetch } from '../utils/api';

const user = JSON.parse(localStorage.getItem('user') || '{}');

const LiveBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [mySeat, setMySeat] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');

  const formatSlotRange = (timeValue) => {
    const slots = Array.isArray(timeValue)
      ? timeValue
      : typeof timeValue === 'string'
      ? timeValue.split(' - ')
      : [];

    if (slots.length <= 1) return timeValue;
    const start = slots[0]?.split(' - ')[0]?.trim() || slots[0];
    const end = slots[slots.length - 1]?.split(' - ')[1]?.trim() || slots[slots.length - 1];
    return `${start} - ${end}`;
  };

  useEffect(() => {
    if (!event) navigate('/ticket-booking');

    const fetchSeats = async () => {
      const id = encodeURIComponent(`${event.name}__${event.date}__${event.time}`);
      const token = localStorage.getItem('token');

      try {
        const [resAvail, resMyBookings] = await Promise.all([
          apiFetch(`/availability/event/${id}`),
          apiFetch('/bookings', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const available = await resAvail.json();
        const bookings = await resMyBookings.json();

        setSeats(available.seats || []);

        const found = bookings.find(
          b => b.itemId === `${event.name}__${event.date}__${event.time}` && b.status === 'confirmed'
        );
        if (found) setMySeat(found.details.seat);
      } catch (err) {
        console.error('Seat fetch error:', err);
      }
    };

    fetchSeats();
    const interval = setInterval(fetchSeats, 4000);
    return () => clearInterval(interval);
  }, [event]);

  const handleClick = (seat) => {
    if (seat.status !== 'available') return;
    setError('');
    setNotifyMsg('');
    setSuccess('');
    setSelectedSeat(seat.id);
  };

  const handleBook = async () => {
    if (!selectedSeat) return setError('Please select a seat');

    const token = localStorage.getItem('token');
    try {
      const res = await apiFetch('/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'event',
          itemId: `${event.name}__${event.date}__${event.time}`,
          details: {
            ...event,
            seat: selectedSeat
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      setSuccess('Ticket booked! Redirecting to payment...');
      setTimeout(() => {
        navigate('/payment', {
          state: {
            type: 'event',
            items: [{
              ...event,
              seat: selectedSeat
            }]
          }
        });
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
          itemId: `${event.name}__${event.date}__${event.time}`,
          details: {
            name: event.name,
            date: event.date,
            time: event.time,
            seat: seat.id
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

      const getColor = (status, isSelected, id) => {
        if (mySeat === id) return '#198754';
        if (isSelected) return '#0d6efd';
        if (status === 'booked') return '#dc3545';
        if (status === 'pending') return '#0dcaf0';
        return '#adb5bd';
      };

  return (
    <div className="fade-in">
      <Container className="py-5 text-center">
        <h2 className="text-brown mb-3">Book Your Ticket</h2>
        <h5>{event?.name}</h5>
        <p><strong>Date:</strong> {event?.date}</p>
        <p><strong>Time:</strong> {formatSlotRange(event?.time)}</p>
        <p><strong>Venue:</strong> {event?.venue || event?.name}</p>

        <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
          {seats.map(seat => (
<div style={{ position: 'relative' }}>
  <div
    key={seat.id}
    onClick={() => handleClick(seat)}
    style={{
      width: 30,
      height: 30,
      borderRadius: 4,
      backgroundColor: getColor(seat.status, selectedSeat === seat.id, seat.id),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '0.8rem',
      cursor: seat.status === 'available' ? 'pointer' : 'not-allowed',
      border: mySeat === seat.id ? '2px solid white' : 'none'
    }}
    title={`Seat ${seat.id}`}
            >
              {seat.id}
            </div>
            {(seat.status === 'booked' || seat.status === 'pending') && (
              <Button
                variant="light"
                size="sm"
                style={{
                  position: 'absolute',
                  top: 32,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '1px 6px',
                  fontSize: '0.65rem'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotify(seat);
                }}
              >
                Notify Me
              </Button>
            )}
          </div>
          ))}
        </div>

      <div className="text-center mt-4">
        <span className="me-3">
          <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#198754', marginRight: 5 }} /> Your Booking
        </span>
        <span className="me-3">
          <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#0d6efd', marginRight: 5 }} /> Selected
        </span>
        <span className="me-3">
          <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#adb5bd', marginRight: 5 }} /> Available
        </span>
        <span className="me-3">
          <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#dc3545', marginRight: 5 }} /> Booked
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#0dcaf0', marginRight: 5 }} /> Pending
        </span>
      </div>

        {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
        {success && <Alert variant="success" className="mt-4">{success}</Alert>}
        {notifyMsg && <Alert variant="info" className="mt-4">{notifyMsg}</Alert>}

        {selectedSeat && (
          <div className="mt-4">
            <p><strong>Selected Seat:</strong> {selectedSeat}</p>
            <Button className="bg-brown border-0" onClick={handleBook}>
              Proceed to Payment
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default LiveBooking;
