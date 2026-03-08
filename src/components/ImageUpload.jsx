import React, { useRef, useState } from 'react';
import './ImageUpload.css';

export default function ImageUpload({ onUpload, disabled }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(selected);
  };

  const handleSend = () => {
    if (file) {
      onUpload(file);
      setPreview(null);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleSelect}
        className="image-upload__input"
        id="image-upload-input"
      />
      <label htmlFor="image-upload-input" className="image-upload__btn" title="Send Image">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </label>

      {preview && (
        <div className="image-upload__preview-overlay">
          <div className="image-upload__preview-card">
            <img src={preview} alt="Preview" className="image-upload__preview-img" />
            <div className="image-upload__preview-actions">
              <button className="image-upload__cancel" onClick={handleCancel}>Cancel</button>
              <button className="image-upload__send" onClick={handleSend} disabled={disabled}>
                Send Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
