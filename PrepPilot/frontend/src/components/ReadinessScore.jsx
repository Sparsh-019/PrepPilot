import React from 'react';

/**
 * Circular readiness-score gauge (0-100) drawn with plain SVG — no chart
 * library dependency needed for a single-value radial indicator.
 */
export default function ReadinessScore({ score = 0, label = 'Placement Readiness' }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  const color = clamped >= 75 ? '#16a34a' : clamped >= 50 ? '#d97706' : '#dc2626';

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} stroke="#e2e8f0" strokeWidth="12" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="700" fill="#1e293b">
          {clamped}
        </text>
        <text x="70" y="86" textAnchor="middle" fontSize="12" fill="#64748b">
          / 100
        </text>
      </svg>
      <p className="mt-2 text-sm font-medium text-slate-600 text-center">{label}</p>
    </div>
  );
}
