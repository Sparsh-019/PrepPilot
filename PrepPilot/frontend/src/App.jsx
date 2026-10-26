import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DSATracker from './pages/DSATracker.jsx';
import Quizzes from './pages/Quizzes.jsx';
import QuizAttempt from './pages/QuizAttempt.jsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer.jsx';
import InterviewPrep from './pages/InterviewPrep.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('preppilot_theme');
    return ['light', 'dark', 'warm'].includes(storedTheme) ? storedTheme : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('preppilot_theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen">
      <Navbar theme={theme} onThemeChange={setTheme} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dsa"
            element={
              <ProtectedRoute>
                <DSATracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <Quizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:id"
            element={
              <ProtectedRoute>
                <QuizAttempt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumeAnalyzer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewPrep />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
