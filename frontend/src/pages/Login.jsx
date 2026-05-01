import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card slide-up">
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          <span className="nav-brand" style={{ fontSize: '1.3rem' }}>TaskFlow</span>
        </div>
        <h2 className="auth-title text-center">Welcome back</h2>
        <p className="auth-subtitle text-center">Sign in to manage your projects</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block mt-1" disabled={loading}>
            <LogIn size={15} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-footer">Don't have an account? <Link to="/signup">Create one</Link></div>
      </div>
    </div>
  );
}
