import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const TARGET_ROLES = ['SDE', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'Default'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', college: '', branch: '',
    graduationYear: '', targetRole: 'SDE',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({
        ...form,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="card w-full max-w-lg">
        <h1 className="text-2xl font-bold text-brand-600 mb-1">Create your PrepPilot account</h1>
        <p className="text-sm text-slate-500 mb-6">Start tracking your placement prep in one place.</p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input name="name" required className="input-field" value={form.name} onChange={handleChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" name="email" required className="input-field" value={form.email} onChange={handleChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" name="password" required minLength={6} className="input-field" value={form.password} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">College</label>
            <input name="college" className="input-field" value={form.college} onChange={handleChange} placeholder="PSIT Kanpur" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
            <input name="branch" className="input-field" value={form.branch} onChange={handleChange} placeholder="BCA" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Graduation Year</label>
            <input type="number" name="graduationYear" className="input-field" value={form.graduationYear} onChange={handleChange} placeholder="2027" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
            <select name="targetRole" className="input-field" value={form.targetRole} onChange={handleChange}>
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary sm:col-span-2 mt-2">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
