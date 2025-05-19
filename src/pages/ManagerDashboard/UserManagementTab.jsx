// UserManagementTab.jsx – Approve organizers, manage roles

import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { apiFetch } from '../../utils/api';

const UserManagementTab = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [organizerFilter, setOrganizerFilter] = useState('all');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
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

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await apiFetch(`/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Role update failed');

      setSuccess(`Updated role for ${data.user.name}`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirm = window.confirm('Are you sure you want to delete this user?');
    if (!confirm) return;

    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    const matchesOrganizer =
      organizerFilter === 'all' ||
      (organizerFilter === 'yes' && u.organizerRequest) ||
      (organizerFilter === 'no' && !u.organizerRequest);

    return matchesSearch && matchesRole && matchesOrganizer;
  });

  return (
    <div>
      <h4 className="text-center mb-3">👥 Manage Users</h4>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {success && <Alert variant="success" className="text-center">{success}</Alert>}

      <Card className="p-4 shadow-sm mb-4">
        <Row className="g-3">
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="visitor">Visitor</option>
              <option value="organizer">Organizer</option>
              <option value="staff">Staff</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Select value={organizerFilter} onChange={(e) => setOrganizerFilter(e.target.value)}>
              <option value="all">All Organizer Requests</option>
              <option value="yes">Requested</option>
              <option value="no">Not Requested</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

      <Card className="p-4 shadow-sm">
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Organizer Request</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="5" className="text-center">No users found.</td></tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <Form.Select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      size="sm"
                    >
                      <option value="visitor">Visitor</option>
                      <option value="organizer">Organizer</option>
                      <option value="staff">Staff</option>
                    </Form.Select>
                  </td>
                  <td>{u.organizerRequest ? 'Yes' : 'No'}</td>
                  <td className="d-flex gap-2 flex-wrap">
                    {u.organizerRequest && u.role === 'visitor' && (
                      <Button size="sm" variant="success" onClick={() => approveOrganizer(u._id)}>
                        Approve
                      </Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => handleDeleteUser(u._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default UserManagementTab;
