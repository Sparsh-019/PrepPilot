import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const TYPES = ['Technical', 'HR', 'Behavioral'];

export default function InterviewPrep() {
  const { user } = useAuth();
  const [type, setType] = useState('Technical');
  const [role, setRole] = useState(user?.targetRole || 'SDE');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/interview/questions', { params: { type } })
      .then(({ data }) => {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(''));
        setAttempt(null);
      })
      .catch(() => setError('Could not load interview questions.'))
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    api.get('/interview/history').then(({ data }) => setHistory(data.attempts)).catch(() => {});
  }, [attempt]);

  const handleAnswerChange = (idx, value) => {
    const next = [...answers];
    next[idx] = value;
    setAnswers(next);
  };

  const handleSubmit = async () => {
    setError('');
    if (answers.some((a) => a.trim().length < 5)) {
      setError('Please answer every question with at least a sentence before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const exchanges = questions.map((q, idx) => ({ question: q, answer: answers[idx] }));
      const { data } = await api.post('/interview/attempt', { role, type, exchanges });
      setAttempt(data.attempt);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit this interview attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  const startNewAttempt = () => {
    setAttempt(null);
    setAnswers(new Array(questions.length).fill(''));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Interview Preparation & Mock Interviews</h1>
        <p className="text-slate-500">Practice answering real interview questions and get instant AI feedback.</p>
      </div>

      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="card flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Interview Type</label>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t} onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                  type === t ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-300'
                }`}
              >{t}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} className="input-field" placeholder="e.g. SDE Intern" />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading questions...</p>
      ) : attempt ? (
        <div className="space-y-4">
          <div className="card text-center">
            <h2 className="text-xl font-bold">Interview Feedback</h2>
            <p className="text-3xl font-bold text-brand-600 mt-2">{attempt.overallScore}/100</p>
            <p className="text-slate-500 mt-1">{attempt.summary}</p>
            <button onClick={startNewAttempt} className="btn-primary mt-4">Try Another Round</button>
          </div>
          {attempt.exchanges.map((ex, idx) => (
            <div key={idx} className="card">
              <p className="font-medium text-slate-800">{idx + 1}. {ex.question}</p>
              <p className="text-sm text-slate-600 mt-2 italic">"{ex.answer}"</p>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <MiniStat label="Clarity" value={`${ex.feedback.clarityScore}/10`} />
                <MiniStat label="Relevance" value={`${ex.feedback.relevanceScore}/10`} />
                <MiniStat label="Confidence" value={`${ex.feedback.confidenceScore}/10`} />
              </div>
              <p className="text-sm text-slate-500 mt-3">{ex.feedback.comments}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="card">
              <p className="font-medium text-slate-800 mb-2">{idx + 1}. {q}</p>
              <textarea
                rows={3} className="input-field"
                placeholder="Type your answer here..."
                value={answers[idx]}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
              />
            </div>
          ))}
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Grading your answers...' : 'Submit for AI Feedback'}
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Past Attempts</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((a) => (
                <tr key={a._id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{a.role}</td>
                  <td className="py-2 pr-4">{a.type}</td>
                  <td className="py-2 pr-4 font-medium">{a.overallScore}/100</td>
                  <td className="py-2">{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="text-center bg-slate-50 rounded-lg py-2">
      <p className="font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
