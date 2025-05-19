import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import ChatWindow from '../components/ChatWindow';
import ChatSidebar from '../components/ChatSidebar';
import FeedbackForm from '../components/FeedbackForm';

const user = JSON.parse(localStorage.getItem('user') || '{}');

const ChatPage = () => {
  const [chat, setChat] = useState(null);
  const [staffChats, setStaffChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [tab, setTab] = useState('active');

  useEffect(() => {
    if (user.role === 'staff') {
      loadStaffChats('active');
    } else {
      startChat();
    }
  }, []);

  const loadStaffChats = async (status) => {
    try {
      const res = await apiFetch(`/chat/staff/${status}`);
      const data = await res.json();
      if (res.ok) {
        setStaffChats(data);
        setSelectedChat(data[0] || null);
        setTab(status);
      }
    } catch (err) {
      console.error('Failed to load chats', err);
    }
  };

  const startChat = async () => {
    try {
      const res = await apiFetch('/chat/start', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setChat(data);
    } catch (err) {
      console.error('Start chat failed', err);
    }
  };

  const handleSend = async (text) => {
    const chatId = user.role === 'staff' ? selectedChat?._id : chat?._id;
    if (!chatId) return;

    const res = await apiFetch(`/chat/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    if (res.ok) {
      if (user.role === 'staff') {
        setSelectedChat(data.chat);
        loadStaffChats(tab);
      } else {
        setChat(data.chat);
      }
    }
  };

  const handleFeedbackSubmit = async () => {
    const res = await apiFetch(`/chat/${chat._id}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, comment }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      setRating('');
      setComment('');
      alert('Thanks for your feedback!');
    }
  };

  const handleClose = async () => {
    const chatId = user.role === 'staff' ? selectedChat?._id : chat?._id;
    if (!chatId) return;

    const res = await apiFetch(`/chat/${chatId}/close`, {
      method: 'PATCH'
    });

    if (res.ok) {
      if (user.role === 'staff') {
        loadStaffChats('active');
        setSelectedChat(null);
      } else {
        setChat(null);
      }
    }
  };

  return (
    <div className="d-flex flex-wrap p-3">
        <div className="d-flex justify-content-start mb-3">
            <button className="btn btn-secondary" onClick={() => window.history.back()}>
                ← Back
            </button>
        </div>
      {user.role === 'staff' && (
        <div className="me-4">
          <div className="mb-2">
            <button className={`btn btn-${tab === 'active' ? 'primary' : 'outline-primary'} me-2`} onClick={() => loadStaffChats('active')}>Active</button>
            <button className={`btn btn-${tab === 'history' ? 'primary' : 'outline-primary'}`} onClick={() => loadStaffChats('history')}>History</button>
          </div>
          <ChatSidebar chats={staffChats} selectedChatId={selectedChat?._id} onSelectChat={setSelectedChat} title={`${tab === 'active' ? 'Open Chats' : 'Closed Chats'}`} />
        </div>
      )}

      <div className="flex-grow-1">
        {(chat || selectedChat) ? (
          <>
            <ChatWindow
              chat={user.role === 'staff' ? selectedChat : chat}
              currentUserId={user._id}
              onSend={handleSend}
            />
            {user.role !== 'staff' && chat?.status === 'active' && (
              <div className="mt-3">
                <button className="btn btn-danger" onClick={handleClose}>End Chat</button>
              </div>
            )}
            {user.role !== 'staff' && chat?.status === 'closed' && (
              <FeedbackForm
                rating={rating}
                comment={comment}
                onChangeRating={setRating}
                onChangeComment={setComment}
                onSubmit={handleFeedbackSubmit}
              />
            )}
          </>
        ) : (
          <div className="text-center mt-5 text-muted">No chat selected.</div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
