import React from 'react';

const FeedbackForm = ({ rating, comment, onChangeRating, onChangeComment, onSubmit }) => {
  return (
    <div className="border p-3 rounded mt-3">
      <h6>Feedback</h6>
      <div className="mb-2">
        <label>Rating:</label>
        <select className="form-select" value={rating} onChange={e => onChangeRating(Number(e.target.value))}>
          <option value="">Select</option>
          {[1,2,3,4,5].map(n => (
            <option key={n} value={n}>{n} Star{n > 1 && 's'}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label>Comment:</label>
        <textarea className="form-control" rows="3" value={comment} onChange={e => onChangeComment(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={onSubmit}>Submit</button>
    </div>
  );
};

export default FeedbackForm;
