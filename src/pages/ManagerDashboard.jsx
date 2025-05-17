// ManagerDashboard.jsx
// Park staff portal for managing users, venues, and bookings
// Only accessible by users with the 'staff' role

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const ManagerDashboard = () => {
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [newVenue, setNewVenue] = useState({
    name: '', date: '', capacity: '', availability: '', price: '', image: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role !== 'staff') {
      navigate('/');
    } else {
      fetchUsers();
      fetchVenues();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const approveOrganizer = async (userId) => {
    try {
      const res = await apiFetch(`/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'organizer' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');

      setSuccess(`Approved organizer: ${data.user.name}`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await apiFetch('/venues', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch venues');
      setVenues(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddVenue = async () => {
    try {
      const res = await apiFetch('/venues', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVenue)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Venue added');
      setNewVenue({ name: '', date: '', capacity: '', availability: '', price: '', image: '' });
      fetchVenues();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVenue = async (id) => {
    if (!window.confirm('Delete this venue?')) return;
    try {
      const res = await apiFetch(`/venues/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Venue deleted');
      fetchVenues();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-center text-brown mb-4">👥 Organizer Requests</h2>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {success && <Alert variant="success" className="text-center">{success}</Alert>}

      <Card className="p-4 shadow-sm mb-5">
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Requested Organizer?</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No users found.</td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.organizerRequest ? 'Yes' : 'No'}</td>
                  <td>
                    {u.organizerRequest && u.role === 'visitor' ? (
                      <Button size="sm" variant="success" onClick={() => approveOrganizer(u._id)}>
                        Approve
                      </Button>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      <h2 className="text-center text-brown mb-3">🏛️ Manage Venues</h2>

      <Card className="p-4 shadow-sm mb-4">
        <Row className="g-2">
          {['name', 'date', 'capacity', 'availability', 'price', 'image'].map(field => (
            <Col md={4} key={field}>
              <Form.Control
                type="text"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={newVenue[field]}
                onChange={e => setNewVenue({ ...newVenue, [field]: e.target.value })}
              />
            </Col>
          ))}
          <Col md={12}>
            <Button onClick={handleAddVenue} className="bg-brown w-100 mt-2">
              Add Venue
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="p-4 shadow-sm">
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Capacity</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {venues.map(v => (
              <tr key={v._id}>
                <td>{v.name}</td>
                <td>{v.date}</td>
                <td>{v.availability}</td>
                <td>{v.capacity}</td>
                <td>{v.price}</td>
                <td>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteVenue(v._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default ManagerDashboard;
