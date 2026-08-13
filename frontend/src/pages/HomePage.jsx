import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ArrowRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { reportService } from '../services/reportService';
import ReportCard from '../components/ReportCard';
import { StatCardSkeleton, ReportCardSkeleton } from '../components/LoadingSkeleton';

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, reported: 0, in_progress: 0, resolved: 0 });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsData, reportsData] = await Promise.all([
          reportService.getReportStats(),
          reportService.getReports({ ordering: '-created_at' }),
        ]);
        setStats(statsData);
        setRecentReports((reportsData || []).slice(0, 3));
      } catch (err) {
        setError(err.message || 'Unable to connect to WasteTrack backend API.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <ShieldCheck size={16} />
          <span>Civic Waste Reporting & Accountability Platform</span>
        </div>
        <h1 className="hero-title">
          Keep Our Streets Clean with <span className="gradient-text">WasteTrack</span>
        </h1>
        <p className="hero-subtitle">
          Spot street waste or illegal dumping? Snap a photo, pin the GPS location, and report it instantly to foster transparent, cleaner communities.
        </p>
        <div className="hero-actions">
          <Link to="/report-waste" className="btn btn-primary btn-lg">
            <PlusCircle size={20} />
            <span>Report Waste Now</span>
          </Link>
          <Link to="/reports" className="btn btn-secondary btn-lg">
            <MapPin size={20} />
            <span>Browse All Reports</span>
          </Link>
        </div>
      </section>

      {/* Real-time Statistics Section */}
      <section style={{ margin: '2rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Platform Live Activity</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Activity size={14} color="var(--primary-600)" />
            Real-time DB counts
          </span>
        </div>

        {loading ? (
          <div className="stats-grid">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="stats-grid">
            {/* Total Reports */}
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--slate-100)', color: 'var(--slate-800)' }}>
                <MapPin size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Reports</span>
              </div>
            </div>

            {/* Pending / Reported */}
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--status-reported-bg)', color: 'var(--status-reported-text)' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.reported}</span>
                <span className="stat-label">Reported (Pending)</span>
              </div>
            </div>

            {/* In Progress */}
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--status-progress-bg)', color: 'var(--status-progress-text)' }}>
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.in_progress}</span>
                <span className="stat-label">In Progress</span>
              </div>
            </div>

            {/* Resolved */}
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--status-resolved-bg)', color: 'var(--status-resolved-text)' }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.resolved}</span>
                <span className="stat-label">Resolved Cleanups</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section style={{ margin: '4rem 0 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>How WasteTrack Works</h2>
          <p style={{ color: 'var(--slate-600)', maxWidth: '580px', margin: '0 auto' }}>
            Three simple steps to report street waste and track municipal or volunteer resolution.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Step 1 */}
          <div
            style={{
              background: 'white',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Camera size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>1. Snap & Locate</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem' }}>
              Take a clear picture of the street garbage or waste dump and capture GPS coordinates with one tap.
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: 'white',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-reported-bg)',
                color: 'var(--status-reported-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <PlusCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>2. Submit Report</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem' }}>
              Add a brief description of the waste and submit. Your report is immediately stored with open status.
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: 'white',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-resolved-bg)',
                color: 'var(--status-resolved-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>3. Track & Resolve</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem' }}>
              Track the progress of cleanup on the interactive map from Reported to In Progress and Resolved.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section style={{ margin: '3rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Recent Waste Reports</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', margin: 0 }}>
              Latest reports submitted across your area
            </p>
          </div>

          <Link to="/reports" className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <span>View All Reports</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="reports-grid">
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
          </div>
        ) : recentReports.length > 0 ? (
          <div className="reports-grid">
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div
            style={{
              background: 'white',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No waste reports found</h3>
            <p style={{ color: 'var(--slate-500)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              Your streets are looking great! Be the first person to report waste in your area.
            </p>
            <Link to="/report-waste" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Submit First Report</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
