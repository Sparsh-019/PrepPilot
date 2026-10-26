import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['All', 'Aptitude', 'Technical', 'Verbal', 'DSA'];

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [history, setHistory] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = category !== 'All' ? { category } : {};
    Promise.all([
      api.get('/quizzes', { params }),
      api.get('/quizzes/history/me'),
    ])
      .then(([quizRes, historyRes]) => {
        if (!mounted) return;
        setQuizzes(quizRes.data.quizzes);
        setHistory(historyRes.data.results);
      })
      .catch(() => mounted && setError('Could not load quizzes.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Technical MCQs & Aptitude Quizzes</h1>
        <p className="text-slate-500">Sharpen your fundamentals with timed practice quizzes.</p>
      </div>

      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              category === c ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading quizzes...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((q) => (
            <div key={q._id} className="card flex flex-col">
              <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">{q.category} · {q.difficulty}</span>
              <h3 className="font-semibold text-slate-800 mt-1">{q.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{q.questionCount} questions · ~{q.durationMinutes} min</p>
              <Link to={`/quizzes/${q._id}`} className="btn-primary text-sm text-center mt-4">Start Quiz</Link>
            </div>
          ))}
          {quizzes.length === 0 && (
            <p className="text-sm text-slate-400 col-span-full">
              No quizzes found in this category yet. Run <code>npm run seed</code> in the backend to add sample quizzes.
            </p>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Your Recent Attempts</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">You haven't attempted any quizzes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Quiz</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Correct</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r._id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{r.quiz?.title || 'Quiz removed'}</td>
                    <td className="py-2 pr-4 font-medium">{r.score}%</td>
                    <td className="py-2 pr-4">{r.correctCount}/{r.totalQuestions}</td>
                    <td className="py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
