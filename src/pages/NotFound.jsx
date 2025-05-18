// NotFound.jsx - 404 page displayed for unknown routes

import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="text-center py-5">
      <h1 className="display-4 text-brown">404</h1>
      <p className="lead">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn bg-brown mt-3">Back to Home</Link>
      <div style={{
        textAlign: 'center',
        padding: '30px',
        color: '#999',
        fontSize: '14px',
        backgroundColor: '#f5f3f0',
        marginTop: '40px'
      }}>
        <p>&copy; {new Date().getFullYear()} Galala Innovation Park | All rights reserved.</p>
        <p>Powered by Edaretna Management System</p>
      </div>

    </Container>
  );
};

export default NotFound;
