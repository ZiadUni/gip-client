// FeedbackManagementTab.jsx – View user feedback and cancellation reasons

import React, { useEffect, useState } from 'react';
import { Card, Table, Alert, Badge, Form, Row, Col } from 'react-bootstrap';
import { apiFetch } from '../../utils/api';

const FeedbackManagementTab = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await apiFetch('/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch feedback');
      setFeedbackList(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredFeedback = feedbackList.filter(f =>
    typeFilter === 'all' || f.feedbackType === typeFilter
  );

  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);

  return (
    <div>
      <h4 className="text-center mb-3">📝 User Feedback & Ratings</h4>
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      <Card className="p-4 shadow-sm mb-4">
        <Row>
          <Col md={4}>
            <Form.Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="rating">Ratings</option>
              <option value="cancellation">Cancellations</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

      <Card className="p-4 shadow-sm">
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Booking</th>
              <th>Comment</th>
              <th>Rating</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedback.length === 0 ? (
              <tr><td colSpan="6" className="text-center">No feedback found.</td></tr>
            ) : (
              filteredFeedback.map(f => (
                <tr key={f._id}>
                  <td>{f.user?.name || 'Unknown'}</td>
                  <td>
                    <Badge bg={f.feedbackType === 'rating' ? 'primary' : 'warning'}>
                      {f.feedbackType.charAt(0).toUpperCase() + f.feedbackType.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    {f.booking?.type === 'event' ? '🎟 Event' : '🏛 Venue'}<br />
                    {f.booking?.details?.event || f.booking?.details?.name || '—'}
                  </td>
                  <td>{f.comment || <span className="text-muted">No comment</span>}</td>
                  <td>
                    {f.feedbackType === 'rating' && f.rating
                      ? <span style={{ color: '#f7b100' }}>{renderStars(f.rating)}</span>
                      : '—'}
                  </td>
                  <td>{new Date(f.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default FeedbackManagementTab;
