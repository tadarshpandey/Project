import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { reportService } from '../services/reportService';
import StatusBadge from '../components/StatusBadge';
import MapView from '../components/MapView';
import Toast from '../components/Toast';
import { formatDate, formatRelativeTime, formatCoordinate } from '../utils/formatters';

const STATUS_OPTIONS = [
  { value: 'REPORTED', label: 'Reported', description: 'Pending review' },
  { value: 'IN_PROGRESS', label: 'In Progress', description: 'Cleanup underway' },
  { value: 'RESOLVED', label: 'Resolved', description: 'Waste cleared' },
];

export default function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(location.state?.message || null);
  const [toastType, setToastType] = useState('success');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch report details
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getReportById(id);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  // Handle status update
  const handleStatusChange = async (newStatus) => {
    if (!report || report.status === newStatus || updatingStatus) return;

    setUpdatingStatus(true);
    try {
      const updated = await reportService.updateReportStatus(id, newStatus);
      setReport(updated);
      setToastType('success');
      setToastMessage(`Report status updated to ${newStatus.replace('_', ' ')}!`);

      // Trigger confetti celebration when resolved
      if (newStatus === 'RESOLVED') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#34d399', '#6ee7b7'],
        });
      }
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle report deletion
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await reportService.deleteReport(id);
      navigate('/reports', {
        state: { message: `Report #${id} has been deleted successfully.` },
      });
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to delete report.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: '30px', width: '180px', marginBottom: '1.5rem' }}></div>
        <div className="details-grid">
          <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }}></div>
          <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }}></div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <AlertCircle size={32} />
        </div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Unable to Load Report</h2>
        <p style={{ color: 'var(--slate-600)', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
          {error || 'The requested waste report could not be found or has been removed.'}
        </p>
        <Link to="/reports" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Return to Reports</span>
        </Link>
      </div>
    );
  }

  const imageUrl = report.image_url || report.image;

  return (
    <div className="container">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          type={toastType}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link
          to="/reports"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--slate-600)',
            fontWeight: 600,
            fontSize: '0.925rem',
          }}
        >
          <ArrowLeft size={18} />
          <span>Back to All Reports</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="btn btn-danger btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <Trash2 size={15} />
            <span>Delete Report</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="details-grid">
        {/* Left Column: Image and Map View */}
        <div>
          {/* Photo Card */}
          <div className="details-media-card">
            <div style={{ position: 'relative' }}>
              <img
                src={imageUrl}
                alt={`Waste at ${report.location_name}`}
                className="details-image"
                onClick={() => setImageModalOpen(true)}
                style={{ cursor: 'pointer' }}
              />
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: 'white',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Maximize2 size={14} />
                <span>Expand Photo</span>
              </button>
            </div>
          </div>

          {/* Interactive Map */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Location on Map</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                GPS: {formatCoordinate(report.latitude)}, {formatCoordinate(report.longitude)}
              </span>
            </div>
            <MapView
              latitude={report.latitude}
              longitude={report.longitude}
              locationName={report.location_name}
              status={report.status}
            />
          </div>
        </div>

        {/* Right Column: Information and Status Controller */}
        <div className="details-info-card">
          {/* Header & Status Badge */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--slate-400)', fontWeight: 600 }}>
                REPORT #{report.id}
              </span>
              <h1 style={{ fontSize: '1.65rem', marginTop: '0.25rem', color: 'var(--slate-900)' }}>
                {report.location_name}
              </h1>
            </div>
            <StatusBadge status={report.status} />
          </div>

          {/* Metadata timestamps */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              padding: '0.85rem 1rem',
              background: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              fontSize: '0.85rem',
              color: 'var(--slate-600)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} color="var(--primary-600)" />
              <span>Reported: <strong>{formatDate(report.created_at)}</strong> ({formatRelativeTime(report.created_at)})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={15} color="var(--primary-600)" />
              <span>Updated: <strong>{formatDate(report.updated_at)}</strong></span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--slate-800)' }}>
              Waste Description
            </h3>
            <p
              style={{
                color: 'var(--slate-700)',
                fontSize: '0.95rem',
                lineHeight: '1.65',
                whiteSpace: 'pre-wrap',
                background: 'var(--slate-50)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-200)',
              }}
            >
              {report.description}
            </p>
          </div>

          {/* Interactive Status Management Box */}
          <div className="details-status-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={18} color="var(--primary-600)" />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Update Report Status</h3>
              </div>
              {updatingStatus && (
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <RefreshCw size={12} className="animate-spin" />
                  Saving...
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
              Select a stage to transition the report status in the database:
            </p>

            <div className="status-select-wrapper">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`status-option-btn ${report.status === opt.value ? `selected-${opt.value}` : ''}`}
                >
                  <div>{opt.label}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8, marginTop: '0.15rem' }}>
                    {opt.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates Summary */}
          <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            <div>
              <strong>Latitude:</strong> {report.latitude}
            </div>
            <div>
              <strong>Longitude:</strong> {report.longitude}
            </div>
          </div>
        </div>
      </div>

      {/* High-Resolution Image Modal */}
      {imageModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setImageModalOpen(false)}
        >
          <img
            src={imageUrl}
            alt="Waste Enlarged"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Delete this waste report?</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently remove Report #{report.id}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
