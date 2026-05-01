import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/signup', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <div className="auth-page">
      <div className="auth-card card slide-up">
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          <span className="nav-brand" style={{ fontSize: '1.3rem' }}>TaskFlow</span>
        </div>
        <h2 className="auth-title text-center">Create account</h2>
        <p className="auth-subtitle text-center">Start managing your team's projects</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" placeholder="John Doe" value={formData.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" placeholder="john@example.com" value={formData.email} onChange={e => update('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" placeholder="Min 6 characters" value={formData.password} onChange={e => update('password', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-control" value={formData.role} onChange={e => update('role', e.target.value)}>
              <option value="Member">Team Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-block mt-1" disabled={loading}>
            <UserPlus size={15} /> {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
