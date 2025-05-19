// ManagerDashboard.jsx
// Tabbed interface for admin tasks: users, venues, feedback

import React from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UserManagementTab from './UserManagementTab';
import VenueManagementTab from './VenueManagementTab';
import FeedbackManagementTab from './FeedbackManagementTab';
import BookingManagementTab from './BookingMangementTab';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-start mb-3">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <h2 className="text-center text-brown mb-4">🛠️ Manager Dashboard</h2>

      <Tabs defaultActiveKey="users" className="mb-3 custom-tabs" fill>
        <Tab eventKey="users" title="User Management">
          <UserManagementTab />
        </Tab>

        <Tab eventKey="venues" title="Venue Management">
          <VenueManagementTab />
        </Tab>

        <Tab eventKey="bookings" title="Booking Management">
        <BookingManagementTab />
        </Tab>

        <Tab eventKey="feedback" title="Feedback & Ratings">
          <FeedbackManagementTab />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ManagerDashboard;
