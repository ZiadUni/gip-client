import React from 'react';
import { formatTimestamp } from '../utils/time';

const ChatWindow = ({ chat, currentUserId, onSend }) => {
  const [text, setText] = React.useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="chat-window border p-3 rounded shadow-sm" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
      <div className="mb-3">
        {chat?.messages?.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.sender === currentUserId ? 'text-end' : 'text-start'}`}>
            <div className={`d-inline-block px-3 py-2 rounded ${msg.sender === currentUserId ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
              {msg.text}
              <div className="text-muted small mt-1">{formatTimestamp(msg.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2">
        <input
          className="form-control"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button className="btn btn-success" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
