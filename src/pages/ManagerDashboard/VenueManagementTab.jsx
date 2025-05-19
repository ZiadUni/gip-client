// VenueManagementTab.jsx – Manages venue add/edit/delete

import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Alert, Form, Row, Col, Image
} from 'react-bootstrap';
import { apiFetch } from '../../utils/api';

const VenueManagementTab = () => {
  const [venues, setVenues] = useState([]);
  const [newVenue, setNewVenue] = useState({
    name: '', date: '', capacity: '', availability: 'Available', price: '', image: ''
  });
  const [editVenueId, setEditVenueId] = useState(null);
  const [editVenueData, setEditVenueData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  const isValidImageUrl = (url) =>
    url && /\.(jpg|jpeg|png|webp|gif)$/i.test(url.trim());

  const isValidDate = (dateStr) => {
    const today = new Date();
    const inputDate = new Date(dateStr);
    const futureLimit = new Date();
    futureLimit.setFullYear(today.getFullYear() + 1);
    return inputDate >= today && inputDate <= futureLimit;
  };

  const formatDate = (rawDate) => {
    const date = new Date(rawDate);
    return date.toLocaleDateString('en-GB');
  };

  useEffect(() => {
    fetchVenues();
  }, []);

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
    const { image, date } = newVenue;

    if (!isValidImageUrl(image)) {
      setError('Invalid image link. Must end in .jpg, .png, .webp, etc.');
      return;
    }

    if (!isValidDate(date)) {
      setError('Invalid date. Must not be in the past or more than 1 year ahead.');
      return;
    }

    const defaultSlots = [
      "8:00 AM - 10:00 AM",
      "10:00 AM - 12:00 PM",
      "12:00 PM - 2:00 PM",
      "2:00 PM - 4:00 PM",
      "4:00 PM - 6:00 PM"
    ];

    const formattedVenue = {
      ...newVenue,
      price: newVenue.price.startsWith('$') ? newVenue.price : `$${newVenue.price}`,
      details: { slots: defaultSlots }
    };

    try {
      const res = await apiFetch('/venues', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedVenue)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess('Venue added');
      setNewVenue({
        name: '', date: '', capacity: '', availability: 'Available', price: '', image: ''
      });
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

  const handleEditVenue = (venue) => {
    setEditVenueId(venue._id);
    setEditVenueData({ ...venue });
  };

  const handleCancelEdit = () => {
    setEditVenueId(null);
    setEditVenueData({});
  };

  const handleSaveEdit = async () => {
    const { image, date } = editVenueData;

    if (!isValidImageUrl(image)) {
      setError('Invalid image link. Must end in .jpg, .png, .webp, etc.');
      return;
    }

    if (!isValidDate(date)) {
      setError('Invalid date. Must not be in the past or more than 1 year ahead.');
      return;
    }

    const formatted = {
      ...editVenueData,
      price: editVenueData.price.startsWith('$')
        ? editVenueData.price
        : `$${editVenueData.price}`
    };

    try {
      const res = await apiFetch(`/venues/${editVenueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formatted)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess('Venue updated');
      setEditVenueId(null);
      setEditVenueData({});
      fetchVenues();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {success && <Alert variant="success" className="text-center">{success}</Alert>}

      {/* Add Venue Form */}
      <Card className="p-4 shadow-sm mb-4">
        <Row className="g-2">
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Name"
              value={newVenue.name}
              onChange={e => setNewVenue({ ...newVenue, name: e.target.value })}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="date"
              value={newVenue.date}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
              onChange={e => setNewVenue({ ...newVenue, date: e.target.value })}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="number"
              placeholder="Capacity"
              value={newVenue.capacity}
              onChange={e => setNewVenue({ ...newVenue, capacity: e.target.value })}
            />
          </Col>
          <Col md={4}>
            <Form.Select
              value={newVenue.availability}
              onChange={e => setNewVenue({ ...newVenue, availability: e.target.value })}
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Price"
              value={newVenue.price}
              onChange={e => setNewVenue({ ...newVenue, price: e.target.value })}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Image Link"
              value={newVenue.image}
              onChange={e => setNewVenue({ ...newVenue, image: e.target.value })}
            />
          </Col>
          <Col md={12}>
            <Button onClick={handleAddVenue} className="bg-brown w-100 mt-2">
              Add Venue
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Venue Table */}
      <Card className="p-4 shadow-sm">
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Capacity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Image</th>
              <th>Image URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {venues.map(venue => (
              <tr key={venue._id}>
                {editVenueId === venue._id ? (
                  <>
                    <td><Form.Control value={editVenueData.name} onChange={e => setEditVenueData({ ...editVenueData, name: e.target.value })} /></td>
                    <td>
                      <Form.Control
                        type="date"
                        value={editVenueData.date}
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                        onChange={e => setEditVenueData({ ...editVenueData, date: e.target.value })}
                      />
                    </td>
                    <td><Form.Control value={editVenueData.availability} onChange={e => setEditVenueData({ ...editVenueData, availability: e.target.value })} /></td>
                    <td><Form.Control value={editVenueData.capacity} onChange={e => setEditVenueData({ ...editVenueData, capacity: e.target.value })} /></td>
                    <td><Form.Control value={editVenueData.price} onChange={e => setEditVenueData({ ...editVenueData, price: e.target.value })} /></td>
                    <td><Form.Control value={editVenueData.status} onChange={e => setEditVenueData({ ...editVenueData, status: e.target.value })} /></td>
                    <td>
                      <Image src={editVenueData.image} alt="preview" width="60" height="40" rounded />
                    </td>
                    <td>
                      <Form.Control value={editVenueData.image} onChange={e => setEditVenueData({ ...editVenueData, image: e.target.value })} />
                    </td>
                    <td>
                      <Button size="sm" onClick={handleSaveEdit} className="me-2 bg-success">Save</Button>
                      <Button size="sm" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{venue.name}</td>
                    <td>{formatDate(venue.date)}</td>
                    <td>{venue.availability}</td>
                    <td>{venue.capacity}</td>
                    <td>{venue.price}</td>
                    <td>{venue.status}</td>
                    <td>{venue.image && <Image src={venue.image} alt="venue" width="60" height="40" rounded />}</td>
                    <td>{venue.image}</td>
                    <td>
                      <Button size="sm" variant="info" className="me-2" onClick={() => handleEditVenue(venue)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteVenue(venue._id)}>Delete</Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default VenueManagementTab;
