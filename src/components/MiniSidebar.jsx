// MiniSidebar.jsx
// Toggleable sidebar with RBAC-based links

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MiniSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role;

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
          left: isOpen ? '0px' : '-100px',
          transition: 'all 0.4s ease',
          zIndex: 1000
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: '50%',
            right: isOpen ? '-20px' : '-12px',
            transform: 'translateY(-50%)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#623E2A',
            color: '#fff',
            border: 'none',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            zIndex: 1001
          }}
        >
          <i className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
        </button>

        <Link to="/" className="sidebar-link">
          <div className="icon-label">
            <span role="img" aria-label="Home">🏠</span>
            <span className="label">Home</span>
          </div>
        </Link>

        {role === 'staff' && (
          <Link to="/metrics" className="sidebar-link">
            <div className="icon-label">
              <span role="img" aria-label="Metrics">📊</span>
              <span className="label">Metrics</span>
            </div>
          </Link>
        )}

        <Link to="/ticket-booking" className="sidebar-link">
          <div className="icon-label">
            <span role="img" aria-label="Tickets">🎟️</span>
            <span className="label">Tickets</span>
          </div>
        </Link>

        {role !== 'visitor' && (
          <Link to="/venue-booking" className="sidebar-link">
            <div className="icon-label">
              <span role="img" aria-label="Venues">🏛️</span>
              <span className="label">Venues</span>
            </div>
          </Link>
        )}

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
