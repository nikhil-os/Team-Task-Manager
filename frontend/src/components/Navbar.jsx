import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, FolderKanban } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      padding: '16px 0',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Task Manager</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/projects" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
              <FolderKanban size={18} /> Projects
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {user.name} ({user.role})
            </span>
          )}
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', color: 'var(--danger)', padding: '6px 12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <LogOut size={16} style={{ marginRight: '6px' }}/> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
