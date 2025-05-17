// Navbar.jsx
// Main navigation bar shown on all pages with dynamic link rendering based on authentication and role

import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AppNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isVisitor = user.role === 'visitor';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/ticket-booking', label: 'Book Tickets' },
    { path: '/venue-booking', label: 'Book Venue' },
    { path: '/metrics', label: 'Metrics' },
    { path: '/about', label: 'About Us' },
    { path: '/my-bookings', label: 'My Bookings' },
    { path: '/manager', label: 'Manager Panel' }
  ];

  return (
    <Navbar expand="lg" className="custom-navbar shadow-sm bg-custom" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          Galala Innovation Park
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-center">
            {token && (
              <div className="d-flex flex-wrap align-items-center gap-3">
                {navLinks.map(link => {
                  if (link.path === '/venue-booking' && isVisitor) return null;
                  if (link.path === '/metrics' && user.role !== 'staff') return null;
                  if (link.path === '/manager' && user.role !== 'staff') return null;

                  return (
                    <Nav.Link
                      key={link.path}
                      as={Link}
                      to={link.path}
                      active={location.pathname === link.path}
                      className={location.pathname === link.path ? 'fw-semibold text-warning' : ''}
                    >
                      {link.label}
                    </Nav.Link>
                  );
                })}
                <span className="text-white small">
                  👤 Role: <strong>{user.role}</strong>
                </span>
                <Nav.Link onClick={handleLogout} className="text-danger fw-semibold">
                  Log Out
                </Nav.Link>
              </div>
            )}

            {!token && (
              <div className="d-flex gap-3">
                <Nav.Link
                  as={Link}
                  to="/login"
                  className={location.pathname === '/login' ? 'fw-semibold text-warning' : ''}
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className={location.pathname === '/register' ? 'fw-semibold text-warning' : ''}
                >
                  Register
                </Nav.Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
