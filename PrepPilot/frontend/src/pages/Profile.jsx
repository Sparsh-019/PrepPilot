import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const TARGET_ROLES = ['SDE', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'Default'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    branch: user?.branch || '',
    graduationYear: user?.graduationYear || '',
    targetRole: user?.targetRole || 'SDE',
    skills: (user?.skills || []).join(', '),
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const payload = {
        ...form,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await api.put('/auth/me', payload);
      updateUser(data.user);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Management</h1>
        <p className="text-slate-500">Keep your details up to date for a more personalized roadmap.</p>
      </div>

      {message && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input name="name" className="input-field" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">College</label>
            <input name="college" className="input-field" value={form.college} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
            <input name="branch" className="input-field" value={form.branch} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Graduation Year</label>
            <input type="number" name="graduationYear" className="input-field" value={form.graduationYear} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
            <select name="targetRole" className="input-field" value={form.targetRole} onChange={handleChange}>
              {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
            <input name="skills" className="input-field" value={form.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB" />
          </div>

          <button type="submit" disabled={saving} className="btn-primary sm:col-span-2">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-2">Account</h2>
        <p className="text-sm text-slate-500">Email: <span className="text-slate-700">{user?.email}</span></p>
        <p className="text-sm text-slate-500 mt-1">Role: <span className="text-slate-700 capitalize">{user?.role}</span></p>
        <p className="text-sm text-slate-500 mt-1">Current Readiness Score: <span className="text-slate-700 font-medium">{user?.readinessScore}/100</span></p>
      </div>
    </div>
  );
}
