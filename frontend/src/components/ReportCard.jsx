import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, ImageOff } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatRelativeTime, truncateText } from '../utils/formatters';

export default function ReportCard({ report }) {
  const imageUrl = report.image_url || report.image;

  return (
    <article className="report-card">
      <div className="report-card-media">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Waste report at ${report.location_name}`}
            className="report-card-image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          style={{
            display: imageUrl ? 'none' : 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--slate-200)',
            color: 'var(--slate-400)',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <ImageOff size={32} />
          <span style={{ fontSize: '0.8rem' }}>No photo available</span>
        </div>
        <div className="report-card-badge-overlay">
          <StatusBadge status={report.status} />
        </div>
      </div>

      <div className="report-card-body">
        <div className="report-card-location" title={report.location_name}>
          <MapPin size={18} color="var(--primary-600)" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {report.location_name}
          </span>
        </div>

        <p className="report-card-desc">
          {truncateText(report.description, 110)}
        </p>

        <div className="report-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} />
            <span>{formatRelativeTime(report.created_at)}</span>
          </div>

          <Link
            to={`/reports/${report.id}`}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.25rem' }}
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
