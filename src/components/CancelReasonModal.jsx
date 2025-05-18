import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { apiFetch } from '../utils/api';

const CancelReasonModal = ({ show, onClose, bookingId, onSubmitted }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch('/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId,
          comment: reason,
          feedbackType: 'cancellation'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSubmitted?.(); // Refresh bookings
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>❓ Why did you cancel?</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light rounded shadow-sm p-3">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Cancellation reason submitted.</Alert>}
        <Form.Group>
          <Form.Label>Please tell us why you cancelled this booking:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button className="bg-brown" onClick={handleSubmit}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CancelReasonModal;
