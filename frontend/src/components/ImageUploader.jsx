import React, { useState, useRef } from 'react';
import { UploadCloud, Image, X, AlertCircle } from 'lucide-react';
import { validateImageFile } from '../utils/validators';

export default function ImageUploader({ selectedFile, onFileSelected, onFileRemoved }) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    setError('');
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Generate local preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemoved();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        style={{ display: 'none' }}
      />

      {previewUrl ? (
        <div className="upload-preview-container">
          <img src={previewUrl} alt="Waste preview" className="upload-preview-img" />
          <div className="upload-preview-overlay">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Image size={18} />
              <span>{selectedFile ? `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)` : 'Selected photo'}</span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="btn btn-danger btn-sm"
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <X size={16} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`upload-dropzone ${dragOver ? 'dragover' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-700)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <UploadCloud size={28} />
          </div>
          <h4 style={{ fontSize: '1.05rem', color: 'var(--slate-800)', marginBottom: '0.35rem' }}>
            Click to upload or drag & drop photograph
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: 0 }}>
            Supports JPG, PNG, WEBP (Max 5 MB)
          </p>
        </div>
      )}

      {error && (
        <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
