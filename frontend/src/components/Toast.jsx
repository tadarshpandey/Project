import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ type = 'success', message, onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        backgroundColor: isSuccess ? '#065f46' : isError ? '#991b1b' : 'var(--slate-900)',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: 500,
        maxWidth: '420px',
        animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {isSuccess && <CheckCircle2 size={20} color="#a7f3d0" />}
      {isError && <AlertCircle size={20} color="#fca5a5" />}
      {!isSuccess && !isError && <Info size={20} color="#93c5fd" />}
      <span style={{ flex: 1, whiteSpace: 'pre-line' }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
