import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const TARGET_ROLES = ['SDE', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'Default'];

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [mode, setMode] = useState('file'); // 'file' | 'text'
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'SDE');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/resume/history').then(({ data }) => setHistory(data.resumes)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'file' && !file) {
      setError('Please choose a PDF resume file to upload.');
      return;
    }
    if (mode === 'text' && pastedText.trim().length < 30) {
      setError('Please paste at least a few sentences of resume text.');
      return;
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('targetRole', targetRole);
      if (mode === 'file') {
        formData.append('resume', file);
      } else {
        formData.append('rawText', pastedText);
      }

      const { data } = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.resume);
      setHistory((prev) => [data.resume, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not analyze this resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Resume & ATS Analyzer</h1>
        <p className="text-slate-500">Get an ATS score, keyword gaps, and actionable improvements — tailored to your target role.</p>
      </div>

      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setMode('file')} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${mode === 'file' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-300'}`}>
              Upload PDF
            </button>
            <button type="button" onClick={() => setMode('text')} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${mode === 'text' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-300'}`}>
              Paste Text
            </button>
          </div>

          {mode === 'file' ? (
            <input
              type="file" accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="input-field"
            />
          ) : (
            <textarea
              rows={8} className="input-field"
              placeholder="Paste your resume text here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="input-field max-w-xs">
              {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button type="submit" disabled={analyzing} className="btn-primary">
            {analyzing ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </form>
      </div>

      {result && (
        <div className="card">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <h2 className="font-semibold text-slate-800">Analysis: {result.fileName}</h2>
            <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
              result.analysis.passLikelihood === 'High' ? 'bg-green-100 text-green-700' :
              result.analysis.passLikelihood === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
            }`}>
              {result.analysis.passLikelihood} pass likelihood
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Stat label="ATS Score" value={`${result.analysis.atsScore}/100`} />
            <Stat label="Matched Keywords" value={result.analysis.matchedKeywords.length} />
            <Stat label="Missing Keywords" value={result.analysis.missingKeywords.length} />
          </div>

          <p className="text-sm text-slate-600 mb-4">{result.analysis.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-green-700 mb-2">Strengths</h3>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {result.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                {result.analysis.strengths.length === 0 && <li className="list-none text-slate-400">None identified yet.</li>}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-700 mb-2">Improvements</h3>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {result.analysis.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          {result.analysis.missingKeywords.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.analysis.missingKeywords.map((k) => (
                  <span key={k} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{k}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Past Analyses</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4">File</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">ATS Score</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r._id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{r.fileName}</td>
                  <td className="py-2 pr-4">{r.targetRole}</td>
                  <td className="py-2 pr-4 font-medium">{r.analysis.atsScore}/100</td>
                  <td className="py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center bg-slate-50 rounded-lg py-3">
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
