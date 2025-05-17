// Park staff portal for managing users, venues, and bookings
// Only accessible by users with the 'staff' role

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const ManagerDashboard = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'staff') {
        navigate('/');
        } else {
        fetchUsers();
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

  return (
    <Container className="py-5">
      <h2 className="text-center text-brown mb-4">👥 Organizer Requests</h2>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {success && <Alert variant="success" className="text-center">{success}</Alert>}

      <Card className="p-4 shadow-sm">
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
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">No users found.</td>
              </tr>
            )}
            {users.map(u => (
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
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default ManagerDashboard;
