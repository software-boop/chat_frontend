import React, { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../utils/socket';
import { getMessages, uploadImage } from '../utils/api';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import ImageUpload from '../components/ImageUpload';
import './Chat.css';

export default function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load messages & connect socket
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await getMessages(1, 200);
        setMessages(res.data.messages);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();

    // Connect socket
    socket.connect();
    socket.emit('user:join', { userId: user.id, username: user.username });

    // Socket listeners
    socket.on('message:receive', (msg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 100);

      // Mark as seen
      if (msg.sender?._id !== user.id) {
        socket.emit('messages:seen', { userId: user.id });
      }
    });

    socket.on('typing:start', ({ username }) => {
      setTypingUser(username);
    });

    socket.on('typing:stop', () => {
      setTypingUser(null);
    });

    socket.on('user:online', ({ userId, username, online }) => {
      if (userId !== user.id) {
        setPartnerOnline(online);
        setPartnerName(username);
      }
    });

    socket.on('message:reacted', (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    });

    socket.on('messages:seen', () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.sender?._id === user.id || m.sender === user.id
            ? { ...m, seen: true }
            : m
        )
      );
    });

    return () => {
      socket.off('message:receive');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('user:online');
      socket.off('message:reacted');
      socket.off('messages:seen');
      socket.disconnect();
    };
  }, [user, scrollToBottom]);

  // Send text message
  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socket.emit('message:send', {
      senderId: user.id,
      text: text.trim(),
    });

    socket.emit('typing:stop', { username: user.username });
    setText('');
  };

  // Typing indicator
  const handleTyping = (e) => {
    setText(e.target.value);

    socket.emit('typing:start', { username: user.username });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { username: user.username });
    }, 1500);
  };

  // Send image
  const handleImageUpload = async (file) => {
    setSending(true);
    try {
      const res = await uploadImage(file);
      socket.emit('message:send', {
        senderId: user.id,
        image: res.data.url,
      });
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setSending(false);
    }
  };

  // React to message
  const handleReact = (messageId, emoji) => {
    socket.emit('message:react', {
      messageId,
      emoji,
      userId: user.id,
    });
  };

  // Group messages by date
  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  let lastDateLabel = '';

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header__left">
          <div className="chat-header__avatar">
            {(partnerName || '?')[0]?.toUpperCase()}
            <span
              className={`chat-header__status ${partnerOnline ? 'online' : ''}`}
            ></span>
          </div>
          <div className="chat-header__info">
            <h2 className="chat-header__name">
              {partnerName || 'Secret Messenger'}
            </h2>
            <p className="chat-header__online">
              {partnerOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="chat-header__right">
          <button className="chat-header__logout" onClick={onLogout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-messages">
        <div className="chat-messages__inner">
          {messages.map((msg) => {
            const dateLabel = getDateLabel(msg.createdAt);
            const showDate = dateLabel !== lastDateLabel;
            lastDateLabel = dateLabel;

            return (
              <React.Fragment key={msg._id}>
                {showDate && (
                  <div className="chat-messages__date">
                    <span>{dateLabel}</span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isOwn={
                    (msg.sender?._id || msg.sender) === user.id
                  }
                  onReact={handleReact}
                />
              </React.Fragment>
            );
          })}

          {typingUser && <TypingIndicator username={typingUser} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <form className="chat-input" onSubmit={handleSend}>
        <ImageUpload onUpload={handleImageUpload} disabled={sending} />

        <input
          type="text"
          className="chat-input__field"
          placeholder="Type a message..."
          value={text}
          onChange={handleTyping}
          id="chat-message-input"
        />

        <button
          type="submit"
          className="chat-input__send"
          disabled={!text.trim()}
          id="chat-send-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
