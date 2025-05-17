// Navbar.jsx
// Main navigation bar with role-based links, responsive layout, and role display

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
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold ms-2">
          Galala Innovation Park
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-center px-3">
            {token ? (
              <>
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
                      className={`mx-2 ${location.pathname === link.path ? 'fw-semibold text-warning' : ''}`}
                    >
                      {link.label}
                    </Nav.Link>
                  );
                })}

                <span className="text-white small mx-2">
                  <strong>{user.role}</strong>
                </span>
                <Nav.Link onClick={handleLogout} className="text-danger fw-semibold mx-2">
                  Log Out
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className={`mx-2 ${location.pathname === '/login' ? 'fw-semibold text-warning' : ''}`}
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className={`mx-2 ${location.pathname === '/register' ? 'fw-semibold text-warning' : ''}`}
                >
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
