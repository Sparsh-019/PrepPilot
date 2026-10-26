import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ReadinessScore from '../components/ReadinessScore.jsx';
import ProgressChart from '../components/ProgressChart.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api
      .get('/dashboard')
      .then(({ data }) => mounted && setDashboard(data.dashboard))
      .catch(() => mounted && setError('Could not load dashboard data.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <p className="text-slate-500">Loading your dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!dashboard) return null;

  const { readinessScore, pillars, dsa, quizzesTaken, latestResume, interviewAttemptsTaken, roadmap, streak } = dashboard;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500">Here's where your placement preparation stands today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center justify-center">
          <ReadinessScore score={readinessScore} />
          <p className="text-xs text-slate-400 mt-3 text-center">
            Blended from DSA, quizzes, resume ATS, and interview performance.
          </p>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-slate-800 mb-4">Performance Pillars</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <PillarStat label="DSA" value={pillars.dsaScore} />
            <PillarStat label="Quizzes" value={pillars.avgQuizScore} />
            <PillarStat label="Resume ATS" value={pillars.atsScore} />
            <PillarStat label="Interviews" value={pillars.avgInterviewScore} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-sm text-slate-500">
            <div><span className="font-semibold text-slate-800">{dsa.totalSolved}</span> problems solved</div>
            <div><span className="font-semibold text-slate-800">{quizzesTaken}</span> quizzes taken</div>
            <div><span className="font-semibold text-slate-800">{interviewAttemptsTaken}</span> mock interviews</div>
            <div><span className="font-semibold text-slate-800">{streak?.current || 0}</span> day streak</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">DSA Topic Breakdown</h2>
          <ProgressChart topicBreakdown={dsa.topicBreakdown} />
          <Link to="/dsa" className="btn-secondary text-sm mt-4 inline-block">Log a solved problem</Link>
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-2">Personalized 4-Week Roadmap</h2>
          <p className="text-sm text-slate-500 mb-4">{roadmap?.priorityAdvice}</p>
          <div className="space-y-3">
            {roadmap?.weeks?.map((w) => (
              <div key={w.week} className="border border-slate-200 rounded-lg p-3">
                <p className="font-medium text-sm text-brand-700">Week {w.week}: {w.focus}</p>
                <ul className="list-disc list-inside text-sm text-slate-600 mt-1 space-y-0.5">
                  {w.tasks.map((task, i) => <li key={i}>{task}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {latestResume && (
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-2">Latest Resume Analysis</h2>
          <p className="text-sm text-slate-500 mb-2">{latestResume.analysis.summary}</p>
          <Link to="/resume" className="text-brand-600 text-sm font-medium hover:underline">View full analysis →</Link>
        </div>
      )}
    </div>
  );
}

function PillarStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
