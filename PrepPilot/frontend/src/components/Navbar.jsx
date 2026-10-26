import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Navbar({ theme, onThemeChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-lg font-bold text-brand-600" aria-label="PrepPilot dashboard">
            PrepPilot
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/dsa" className={navLinkClass}>DSA Tracker</NavLink>
            <NavLink to="/quizzes" className={navLinkClass}>Quizzes</NavLink>
            <NavLink to="/resume" className={navLinkClass}>Resume Analyzer</NavLink>
            <NavLink to="/interview" className={navLinkClass}>Mock Interview</NavLink>
            <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:inline">Hi, {user.name.split(' ')[0]}</span>
          <label className="sr-only" htmlFor="theme-select">Color theme</label>
          <select
            id="theme-select"
            aria-label="Color theme"
            value={theme}
            onChange={(event) => onThemeChange(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="warm">Warm</option>
          </select>
          <button onClick={handleLogout} className="btn-secondary text-sm">Logout</button>
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2">
        <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
        <NavLink to="/dsa" className={navLinkClass}>DSA</NavLink>
        <NavLink to="/quizzes" className={navLinkClass}>Quizzes</NavLink>
        <NavLink to="/resume" className={navLinkClass}>Resume</NavLink>
        <NavLink to="/interview" className={navLinkClass}>Interview</NavLink>
        <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
      </nav>
    </header>
  );
}
