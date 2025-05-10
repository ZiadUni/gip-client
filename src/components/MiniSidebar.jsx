// MiniSidebar.jsx
// This sidebar appears after scrolling 150px down and provides quick navigation links

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MiniSidebar = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 150);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div
      className="sidebar"
      style={{
        left: visible ? '0px' : '-100px',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'all 0.4s ease'
      }}
    >
      <Link to="/" className="sidebar-link">
        <div className="icon-label">
          <span role="img" aria-label="Home">🏠</span>
          <span className="label">Home</span>
        </div>
      </Link>

      <Link to="/metrics" className="sidebar-link">
        <div className="icon-label">
          <span role="img" aria-label="Metrics">📊</span>
          <span className="label">Metrics</span>
        </div>
      </Link>

      <Link to="/ticket-booking" className="sidebar-link">
        <div className="icon-label">
          <span role="img" aria-label="Tickets">🎟️</span>
          <span className="label">Tickets</span>
        </div>
      </Link>

      <Link to="/venue-booking" className="sidebar-link">
        <div className="icon-label">
          <span role="img" aria-label="Venues">🏛️</span>
          <span className="label">Venues</span>
        </div>
      </Link>

      <Link to="/my-bookings" className="sidebar-link">
        <div className="icon-label">
          <span role="img" aria-label="My Bookings">📝</span>
          <span className="label">My Bookings</span>
        </div>
      </Link>
    </div>
  );
};

export default MiniSidebar;
