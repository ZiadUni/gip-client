// NotFound.jsx - 404 page displayed for unknown routes

import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="text-center py-5">
          <Button
      variant="secondary"
      onClick={() => navigate(-1)}
      className="mb-3"
    >
      ← Back
    </Button>
      <h1 className="display-4 text-brown">404</h1>
      <p className="lead">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn bg-brown mt-3">Back to Home</Link>
    </Container>
  );
};

export default NotFound;
