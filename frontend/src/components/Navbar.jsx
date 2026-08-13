import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Trash2, PlusCircle, MapPin, Menu, X, Home } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon">
            <Trash2 size={20} />
          </div>
          <span>WasteTrack</span>
          <span className="brand-badge">MVP</span>
        </Link>

        {/* Desktop & Mobile Navigation */}
        <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <Home size={18} />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <MapPin size={18} />
            <span>Reports Feed</span>
          </NavLink>
          <NavLink
            to="/report-waste"
            className="btn btn-primary btn-sm"
            onClick={closeMenu}
          >
            <PlusCircle size={16} />
            <span>Report Waste</span>
          </NavLink>
        </nav>

        {/* Mobile menu trigger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
