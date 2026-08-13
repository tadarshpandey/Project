import React from 'react';
import { Trash2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--slate-800)' }}>
          <Trash2 size={18} color="var(--primary-600)" />
          <span>WasteTrack Civic Platform</span>
        </div>
        <p style={{ margin: 0 }}>
          Clean streets, accountable communities. Built for civic transparency.
        </p>
        <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
          MVP &bull; React &bull; Django REST Framework
        </div>
      </div>
    </footer>
  );
}
