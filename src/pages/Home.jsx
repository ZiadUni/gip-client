// Home.jsx - Landing page after login, brief overview and navigation
// Feature navigation blocks or highlights go here

// Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isVisitor = user.role === 'visitor';

  return (
    <div className="fade-in">
      <div style={container}>
        <div style={heroSection}>
          <h1 style={mainTitle}>Welcome to Galala Innovation Park</h1>
          <p style={subtitle}>
            Empowering innovation, collaboration, and sustainable progress through smart facilities and events.
          </p>
          <div style={buttonGroup}>
            <Link to="/ticket-booking" style={heroButton}>Book Event</Link>

            {!isVisitor && (
              <Link to="/venue-booking" style={heroButton}>Reserve Venue</Link>
            )}

            <Link to="/my-bookings" style={heroButton}>My Bookings</Link>

            <Link to="/support" style={heroButton}>Support Chat</Link>

            {user.role === 'staff' && (
              <>
                <Link to="/metrics" style={heroButton}>View Metrics</Link>
                <Link to="/manager" style={heroButton}>Admin Panel</Link>
              </>
            )}
          </div>
        </div>

        <div style={section}>
          <h2 style={sectionTitle}>Why Galala Innovation Park?</h2>
          <p style={paragraph}>
            At the heart of Galala lies an ecosystem that supports startups, researchers, and innovators. Our mission is
            to streamline collaboration through high-tech labs, event spaces, and data-backed performance insights.
          </p>
        </div>

        <div style={cardGrid}>
          <FeatureCard
            title="Smart Booking System"
            desc="Real-time seat and venue availability with instant booking feedback."
          />
          <FeatureCard
            title="Analytics Dashboard"
            desc="Access key performance metrics for events, users, and resources."
          />
          <FeatureCard
            title="All-in-One Access"
            desc="Centralized profile, booking history, and payment confirmations."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, desc }) => (
  <div style={card}>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

// --- Styles ---
const container = {
  padding: '40px',
  fontFamily: 'Segoe UI, sans-serif',
  maxWidth: '1200px',
  margin: 'auto'
};

const heroSection = {
  textAlign: 'center',
  marginBottom: '50px'
};

const mainTitle = {
  fontSize: '36px',
  color: '#623E2A',
  marginBottom: '10px'
};

const subtitle = {
  fontSize: '18px',
  color: '#333',
  marginBottom: '20px'
};

const buttonGroup = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginTop: '20px'
};

const heroButton = {
  padding: '12px 24px',
  backgroundColor: '#623E2A',
  color: '#fff',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold'
};

const section = {
  textAlign: 'center',
  marginTop: '60px'
};

const sectionTitle = {
  fontSize: '28px',
  color: '#623E2A',
  marginBottom: '10px'
};

const paragraph = {
  fontSize: '16px',
  color: '#444',
  maxWidth: '800px',
  margin: 'auto'
};

const cardGrid = {
  display: 'flex',
  gap: '20px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: '40px'
};

const card = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '20px',
  width: '280px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  textAlign: 'center'
};

const footer = {
  marginTop: '60px',
  textAlign: 'center',
  color: '#999',
  fontSize: '14px'
};

export default Home;
