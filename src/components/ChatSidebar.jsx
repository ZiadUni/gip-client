import React from 'react';
import { formatTimestamp } from '../utils/time';

const ChatSidebar = ({ chats, selectedChatId, onSelectChat, title }) => {
  return (
    <div className="chat-sidebar border-end pe-2" style={{ minWidth: '240px' }}>
      <h6 className="text-brown">{title}</h6>
      {chats.length === 0 && <p className="text-muted small">No chats found.</p>}
      <ul className="list-unstyled">
        {chats.map(chat => (
          <li
            key={chat._id}
            className={`p-2 rounded ${chat._id === selectedChatId ? 'bg-light' : ''}`}
            onClick={() => onSelectChat(chat)}
            style={{ cursor: 'pointer' }}
          >
            <div className="fw-bold">Chat #{chat._id.slice(-4)}</div>
            <div className="small text-muted">{formatTimestamp(chat.lastUpdated)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatSidebar;
