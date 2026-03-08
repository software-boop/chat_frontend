import React, { useState } from 'react';
import ReactionPicker from './ReactionPicker';
import { SERVER_URL } from '../utils/config';
import './MessageBubble.css';

const SERVER = SERVER_URL;

export default function MessageBubble({ message, isOwn, onReact }) {
  const [showReactions, setShowReactions] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <div
        className={`msg-bubble ${isOwn ? 'msg-bubble--own' : 'msg-bubble--other'}`}
        onDoubleClick={() => setShowReactions(true)}
      >
        {!isOwn && (
          <div className="msg-bubble__sender">
            {message.sender?.username || 'Unknown'}
          </div>
        )}

        {message.image && (
          <div className="msg-bubble__image-wrap" onClick={() => setLightbox(true)}>
            <img
              src={`${SERVER}${message.image}`}
              alt="shared"
              className="msg-bubble__image"
              loading="lazy"
            />
          </div>
        )}

        {message.text && <div className="msg-bubble__text">{message.text}</div>}

        <div className="msg-bubble__meta">
          <span className="msg-bubble__time">{time}</span>
          {isOwn && (
            <span className={`msg-bubble__seen ${message.seen ? 'seen' : ''}`}>
              {message.seen ? '✓✓' : '✓'}
            </span>
          )}
        </div>

        {message.reactions?.length > 0 && (
          <div className="msg-bubble__reactions">
            {message.reactions.map((r, i) => (
              <span key={i} className="msg-bubble__reaction" title={r.userId?.username}>
                {r.emoji}
              </span>
            ))}
          </div>
        )}

        <button
          className="msg-bubble__react-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowReactions(true);
          }}
          title="React"
        >
          😊
        </button>
      </div>

      {showReactions && (
        <ReactionPicker
          onReact={(emoji) => onReact(message._id, emoji)}
          onClose={() => setShowReactions(false)}
        />
      )}

      {lightbox && (
        <div className="msg-lightbox" onClick={() => setLightbox(false)}>
          <img src={`${SERVER}${message.image}`} alt="full" />
        </div>
      )}
    </>
  );
}
