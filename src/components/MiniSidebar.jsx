// MiniSidebar.jsx
// Toggleable sidebar with hide/show button

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MiniSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsOpen(!mobile); 
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setIsOpen(prev => !prev);

  return (
    <>
      <div
        className="sidebar"
        style={{
          left: isOpen ? '0px' : '-120px',
          opacity: isOpen ? 1 : 0.3,
          pointerEvents: 'auto',
          transition: 'all 0.4s ease',
          zIndex: 1000
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: '50%',
            right: '-18px',
            transform: 'translateY(-50%)',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            boxShadow: '0 0 4px rgba(0,0,0,0.2)',
            fontSize: '16px',
            cursor: 'pointer',
            zIndex: 1001
          }}
        >
          {isOpen ? '←' : '→'}
        </button>

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
    </>
  );
};

export default MiniSidebar;
