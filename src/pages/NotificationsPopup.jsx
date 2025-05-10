// NotificationsPopup.jsx - Displays toast-style alerts for available slots
// Poll the server every 10s to check for triggered alerts

import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { apiFetch } from '../utils/api';

const NotificationPopup = () => {
  const [notifications, setNotifications] = useState([]);

  // Get/set from localStorage
  const getSeen = () => JSON.parse(localStorage.getItem('seenNotifications') || '[]');
  const addSeen = (id) => {
    const seen = getSeen();
    const updated = [...new Set([...seen, id])];
    localStorage.setItem('seenNotifications', JSON.stringify(updated));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await apiFetch('notification', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error('Failed to fetch notifications');

        const seen = getSeen();
        const unseen = data.filter(n => !seen.includes(n._id));
        if (unseen.length > 0) {
          setNotifications(unseen.slice(0, 3));
        }
      } catch (err) {
        console.error('Notification fetch error:', err.message);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = (id) => {
    addSeen(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  return (
    <ToastContainer position="top-start" className="p-3" style={{ zIndex: 9999, marginTop: '130px', marginLeft: '0px' }}>
      {notifications.map(n => (
        <Toast
          key={n._id}
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #ddd',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
          className="mb-3"
          delay={10000}
          onClose={() => handleClose(n._id)}
        >
          <Toast.Header>
            <strong className="me-auto">🔔 Availability Alert</strong>
          </Toast.Header>
          <Toast.Body style={{ color: '#333'}}>
            {n.type === 'event' ? (
              <>🎟️ Seat <strong>#{n.itemId}</strong> for <strong>{n.details?.title}</strong> is now available!</>
            ) : (
              <>🏢 <strong>{n.details?.name}</strong> has a free slot at <strong>{n.details?.time}</strong>!</>
            )}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default NotificationPopup;
