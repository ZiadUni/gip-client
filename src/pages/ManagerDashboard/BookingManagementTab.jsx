import React, { useEffect, useState } from 'react';
import { Card, Table, Alert, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { apiFetch } from '../../utils/api';
import { unparse } from 'papaparse';

const BookingManagementTab = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await apiFetch('/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings');
      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelBooking = async (id) => {
    const confirm = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirm) return;

    try {
      const res = await apiFetch(`/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = bookings.filter(b =>
    (typeFilter === 'all' || b.type === typeFilter) &&
    (statusFilter === 'all' || b.status === statusFilter)
  );

  const totalBookings = filtered.length;
  const indexOfLast = currentPage * bookingsPerPage;
  const indexOfFirst = indexOfLast - bookingsPerPage;
  const currentBookings = filtered.slice(indexOfFirst, indexOfLast);

  const handleExportCSV = () => {
    const exportData = filtered.map(b => ({
      User: b.user?.name || 'Unknown',
      Email: b.user?.email || 'N/A',
      Type: b.type,
      Booking: b.type === 'event' ? b.details?.event : b.details?.name,
      SeatOrSlot: b.details?.seat || b.details?.time || (b.details?.slots || []).join(', '),
      Status: b.status,
      Date: b.details?.date || '',
      CreatedAt: new Date(b.createdAt).toLocaleString()
    }));

    const csv = unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h4 className="text-center mb-3">📦 Booking Management</h4>
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      <Card className="p-4 shadow-sm mb-4">
        <Row className="g-3">
          <Col md={4}>
            <Form.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="event">Event</option>
              <option value="venue">Venue</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Filter by Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Col>
          <Col md={4} className="text-end">
            <Button variant="outline-dark" size="sm" onClick={handleExportCSV}>
              Export CSV
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="p-4 shadow-sm">
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Details</th>
              <th>Status</th>
              <th>Booked On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length === 0 ? (
              <tr><td colSpan="6" className="text-center">No bookings found.</td></tr>
            ) : (
              currentBookings.map(b => (
                <tr key={b._id}>
                  <td>{b.user?.name || 'Unknown'}<br /><small>{b.user?.email}</small></td>
                  <td>
                    <Badge bg={b.type === 'event' ? 'info' : 'secondary'}>
                      {b.type.charAt(0).toUpperCase() + b.type.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    {b.type === 'event' ? (
                      <>
                        Event: {b.details?.event || '—'}<br />
                        Seat: {b.details?.seat}
                      </>
                    ) : (
                      <>
                        Venue: {b.details?.name}<br />
                        Date: {b.details?.date}<br />
                        Time: {Array.isArray(b.details?.slots)
                          ? b.details.slots.join(', ')
                          : b.details?.time}
                      </>
                    )}
                  </td>
                  <td>
                    <Badge bg={
                      b.status === 'confirmed' ? 'success'
                        : b.status === 'pending' ? 'warning'
                        : 'danger'
                    }>
                      {b.status}
                    </Badge>
                  </td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                  <td>
                    {b.status !== 'cancelled' && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancelBooking(b._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Pagination Controls */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span>Total Bookings: {totalBookings}</span>
          <div>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="me-2"
            >
              ← Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={indexOfLast >= totalBookings}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BookingManagementTab;
