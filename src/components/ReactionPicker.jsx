import React, { useState } from 'react';
import './ReactionPicker.css';

const EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍', '🔥', '🎉'];

export default function ReactionPicker({ onReact, onClose }) {
  return (
    <div className="reaction-picker-overlay" onClick={onClose}>
      <div className="reaction-picker" onClick={(e) => e.stopPropagation()}>
        {EMOJIS.map((emoji, idx) => (
          <button
            key={emoji}
            className="reaction-picker__emoji"
            style={{ animationDelay: `${idx * 0.04}s` }}
            onClick={() => {
              onReact(emoji);
              onClose();
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
