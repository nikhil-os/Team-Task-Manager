import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, FolderKanban, User, X, Save } from 'lucide-react';
import api from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const profileRef = useRef(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Close profile dialog on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    if (showProfile) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfile]);

  const openProfile = () => {
    setProfileData({ name: user?.name || '', email: user?.email || '', password: '' });
    setError('');
    setSuccess('');
    setShowProfile(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = { name: profileData.name, email: profileData.email };
      if (profileData.password) payload.password = profileData.password;
      const res = await api.put('/auth/profile', payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Profile updated successfully');
      setTimeout(() => setShowProfile(false), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span className="nav-brand">TaskFlow</span>
          <div className="nav-links">
            <Link to="/" className={isActive('/')}>
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <Link to="/projects" className={isActive('/projects')}>
              <FolderKanban size={15} /> Projects
            </Link>
          </div>
        </div>

        <div className="nav-right" style={{ position: 'relative' }} ref={profileRef}>
          {user && (
            <>
              <div className="nav-user" onClick={openProfile}>
                <User size={14} />
                {user.name}
                <span className={`badge ${user.role === 'Admin' ? 'badge-admin' : 'badge-member'}`}>
                  {user.role}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <LogOut size={13} /> Logout
              </button>

              {/* Profile Dialog */}
              {showProfile && (
                <div className="profile-dialog card" onClick={e => e.stopPropagation()}>
                  <div className="flex-between mb-2">
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Profile Settings</h4>
                    <button onClick={() => setShowProfile(false)} className="btn btn-sm" style={{ background: 'transparent', padding: '4px', color: 'var(--text-muted)' }}>
                      <X size={16} />
                    </button>
                  </div>

                  {success && <div className="profile-success">{success}</div>}
                  {error && <div className="error-msg">{error}</div>}

                  <form onSubmit={saveProfile}>
                    <div className="form-group">
                      <label>Name</label>
                      <input type="text" className="form-control" value={profileData.name}
                        onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" className="form-control" value={profileData.email}
                        onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label>New Password <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(leave blank to keep current)</span></label>
                      <input type="password" className="form-control" placeholder="Min 6 characters" value={profileData.password}
                        onChange={e => setProfileData(p => ({ ...p, password: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <input type="text" className="form-control" value={user.role} disabled style={{ opacity: 0.5 }} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                      <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
