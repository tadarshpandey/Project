import React from 'react';

export function ReportCardSkeleton() {
  return (
    <div className="report-card" style={{ pointerEvents: 'none' }}>
      <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
      <div style={{ padding: '1.25rem' }}>
        <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '1rem' }}></div>
        <div className="skeleton" style={{ height: '14px', width: '95%', marginBottom: '0.5rem' }}></div>
        <div className="skeleton" style={{ height: '14px', width: '80%', marginBottom: '1.25rem' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: '14px', width: '35%' }}></div>
          <div className="skeleton" style={{ height: '28px', width: '30%', borderRadius: 'var(--radius-sm)' }}></div>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card" style={{ pointerEvents: 'none' }}>
      <div className="skeleton" style={{ width: '3.25rem', height: '3.25rem', borderRadius: 'var(--radius-md)' }}></div>
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: '28px', width: '50px', marginBottom: '0.4rem' }}></div>
        <div className="skeleton" style={{ height: '14px', width: '90px' }}></div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 3, type = 'report' }) {
  return (
    <div className={type === 'report' ? 'reports-grid' : 'stats-grid'}>
      {Array.from({ length: count }).map((_, index) =>
        type === 'report' ? <ReportCardSkeleton key={index} /> : <StatCardSkeleton key={index} />
      )}
    </div>
  );
}
