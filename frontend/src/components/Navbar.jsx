import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, FolderKanban, Shield, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <span className="nav-brand">TaskFlow</span>
          <div className="nav-links">
            <Link to="/" className={isActive('/')}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link to="/projects" className={isActive('/projects')}>
              <FolderKanban size={16} /> Projects
            </Link>
          </div>
        </div>

        <div className="nav-right">
          {user && (
            <>
              <span className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {user.role === 'Admin' ? <Shield size={14} /> : <User size={14} />}
                {user.name}
                <span className={`badge ${user.role === 'Admin' ? 'badge-admin' : 'badge-member'}`} style={{ marginLeft: '4px' }}>
                  {user.role}
                </span>
              </span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <LogOut size={14} /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
