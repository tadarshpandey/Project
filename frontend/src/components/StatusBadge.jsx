import React from 'react';

const STATUS_CONFIG = {
  REPORTED: {
    label: 'Reported',
    className: 'reported',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'in_progress',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'resolved',
  },
};

export default function StatusBadge({ status }) {
  const normalizedStatus = (status || 'REPORTED').toUpperCase();
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.REPORTED;

  return (
    <span className={`status-badge ${config.className}`}>
      <span className="status-dot"></span>
      {config.label}
    </span>
  );
}
