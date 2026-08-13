import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Filter, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { reportService } from '../services/reportService';
import ReportCard from '../components/ReportCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [ordering, setOrdering] = useState('-created_at');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { ordering };
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data = await reportService.getReports(params);
      setReports(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load waste reports. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab, ordering]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Waste Reports Feed</h1>
          <p style={{ color: 'var(--slate-600)', margin: 0 }}>
            Browse and monitor all public garbage and waste incidents reported by citizens.
          </p>
        </div>

        <Link to="/report-waste" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Report New Waste</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        {/* Status Tabs */}
        <div className="filter-tabs">
          {['ALL', 'REPORTED', 'IN_PROGRESS', 'RESOLVED'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'ALL' ? 'All Reports' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by area or description..."
            className="search-input"
          />
        </form>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>Sort:</span>
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-300)',
              backgroundColor: 'white',
              fontSize: '0.85rem',
              color: 'var(--slate-700)',
              outline: 'none',
            }}
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button onClick={fetchReports} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <LoadingSkeleton count={6} type="report" />
      ) : reports.length > 0 ? (
        <div className="reports-grid">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            background: 'white',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            margin: '2rem 0',
          }}
        >
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'var(--slate-100)',
              color: 'var(--slate-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Trash2 size={32} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--slate-800)' }}>
            No waste reports found.
          </h3>
          <p style={{ color: 'var(--slate-500)', maxWidth: '420px', margin: '0 auto 1.75rem', fontSize: '0.95rem' }}>
            {activeTab !== 'ALL' || searchQuery
              ? 'No reports matching your filter criteria. Try adjusting the status or search term.'
              : 'Be the first person to report waste in your area and clean up the neighborhood.'}
          </p>
          <Link to="/report-waste" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Report Waste</span>
          </Link>
        </div>
      )}
    </div>
  );
}
