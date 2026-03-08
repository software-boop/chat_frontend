import React from 'react';
import './TypingIndicator.css';

export default function TypingIndicator({ username }) {
  return (
    <div className="typing-indicator">
      <div className="typing-indicator__bubble">
        <span className="typing-indicator__dot"></span>
        <span className="typing-indicator__dot"></span>
        <span className="typing-indicator__dot"></span>
      </div>
      <span className="typing-indicator__text">{username} is typing...</span>
    </div>
  );
}
