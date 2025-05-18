// About.jsx - Describes the project, team, and contact details
// Static content page showing about info

import React from 'react';
import { Container } from 'react-bootstrap';

const About = () => {
  return (
    <div className="fade-in">
          <Button
      variant="secondary"
      onClick={() => navigate(-1)}
      className="mb-3"
    >
      ← Back
    </Button>      
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      <h1 className="text-brown text-center mb-4">About Galala Innovation Park</h1>
      <p className="text-center mb-5">
        Galala Innovation Park is a dynamic space designed to empower creativity, innovation, and sustainable development.
      </p>

      <section className="mb-4">
        <h4 className="text-brown">🎯 Our Vision</h4>
        <p>
          To become Egypt’s leading hub for tech innovation and collaboration, bridging academia and industry.
        </p>
      </section>

      <section className="mb-4">
        <h4 className="text-brown">📌 Our Mission</h4>
        <p>
          To support startups and researchers with intuitive facility management systems and event platforms backed by analytics.
        </p>
      </section>

      <section className="mb-4">
        <h4 className="text-brown">🔧 What We Offer</h4>
        <ul>
          <li>Live seat and venue booking</li>
          <li>Data-driven performance metrics</li>
          <li>Admin dashboards for employees</li>
          <li>Support for innovation events and training</li>
        </ul>
      </section>

      <section>
        <h4 className="text-brown">📞 Contact Us</h4>
        <p>
          <strong>Email:</strong> info@gipark.com<br />
          <strong>Phone:</strong> +20 123-456-7890<br />
          <strong>Location:</strong> Galala City, Egypt
        </p>
      </section>
    </Container>
    </div>
  );
};

export default About;
