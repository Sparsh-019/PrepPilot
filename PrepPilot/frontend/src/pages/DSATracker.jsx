import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ProgressChart from '../components/ProgressChart.jsx';

const TOPICS = [
  'Arrays', 'Strings', 'LinkedList', 'Stacks', 'Queues', 'Trees', 'Graphs',
  'DynamicProgramming', 'Recursion', 'Sorting', 'Searching', 'Greedy',
  'Backtracking', 'BitManipulation', 'HashMaps', 'Other',
];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function DSATracker() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', topic: 'Arrays', difficulty: 'Easy', platform: 'LeetCode', url: '', timeTakenMinutes: '',
  });

  const loadProgress = () => {
    setLoading(true);
    api
      .get('/dsa')
      .then(({ data }) => setProgress(data.progress))
      .catch(() => setError('Could not load DSA progress.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadProgress, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/dsa/solve', {
        ...form,
        timeTakenMinutes: form.timeTakenMinutes ? Number(form.timeTakenMinutes) : 0,
      });
      setForm({ title: '', topic: 'Arrays', difficulty: 'Easy', platform: 'LeetCode', url: '', timeTakenMinutes: '' });
      loadProgress();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log this problem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (problemId) => {
    try {
      await api.delete(`/dsa/${problemId}`);
      loadProgress();
    } catch {
      setError('Could not delete this entry.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">DSA Progress Tracker</h1>
        <p className="text-slate-500">Log every problem you solve to track readiness by topic and difficulty.</p>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <h2 className="font-semibold text-slate-800 mb-4">Log a Solved Problem</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="title" required placeholder="Problem title (e.g. Two Sum)"
              className="input-field" value={form.title} onChange={handleChange}
            />
            <select name="topic" className="input-field" value={form.topic} onChange={handleChange}>
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select name="difficulty" className="input-field" value={form.difficulty} onChange={handleChange}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input name="platform" placeholder="Platform (e.g. LeetCode)" className="input-field" value={form.platform} onChange={handleChange} />
            <input name="url" placeholder="Problem URL (optional)" className="input-field" value={form.url} onChange={handleChange} />
            <input
              name="timeTakenMinutes" type="number" placeholder="Time taken (minutes)"
              className="input-field" value={form.timeTakenMinutes} onChange={handleChange}
            />
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Saving...' : 'Log Problem'}
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Topic Breakdown</h2>
            {progress && (
              <span className="text-sm text-slate-500">
                {progress.totalSolved} solved · DSA score {progress.score}/100
              </span>
            )}
          </div>
          {!loading && progress && <ProgressChart topicBreakdown={progress.topicBreakdown} />}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Recent Submissions</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : progress?.solvedProblems?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Topic</th>
                  <th className="py-2 pr-4">Difficulty</th>
                  <th className="py-2 pr-4">Platform</th>
                  <th className="py-2 pr-4">Time (min)</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {progress.solvedProblems.slice(0, 20).map((p) => (
                  <tr key={p._id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{p.title}</a>
                      ) : p.title}
                    </td>
                    <td className="py-2 pr-4">{p.topic}</td>
                    <td className="py-2 pr-4">{p.difficulty}</td>
                    <td className="py-2 pr-4">{p.platform}</td>
                    <td className="py-2 pr-4">{p.timeTakenMinutes || '-'}</td>
                    <td className="py-2">
                      <button onClick={() => handleDelete(p._id)} className="text-red-500 text-xs hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No problems logged yet. Add your first one above!</p>
        )}
      </div>
    </div>
  );
}
