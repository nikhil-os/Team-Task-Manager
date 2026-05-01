import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Users, ArrowRight } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'Admin';

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    api.get('/auth/users').then(res => setAllUsers(res.data)).catch(console.error);
  }, []);

  const toggleMember = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const finalMembers = [...new Set([...selectedMembers, user.id])];
      await api.post('/projects', { name, description, members: finalMembers });
      setShowModal(false);
      setName('');
      setDescription('');
      setSelectedMembers([]);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner"></div>
      <span>Loading projects...</span>
    </div>
  );

  return (
    <div className="slide-up">
      <div className="flex-between mb-3">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Projects</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {isAdmin ? 'Manage all projects and teams' : 'Projects you are a member of'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content glass-card">
            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Create New Project</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" className="form-control" placeholder="e.g. Website Redesign" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" placeholder="Brief description of the project..." value={description} onChange={e => setDescription(e.target.value)} rows={3}></textarea>
              </div>
              <div className="form-group">
                <label>Team Members</label>
                <div style={{ maxHeight: '180px', overflowY: 'auto', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                  {allUsers.map(u => (
                    <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: 'var(--transition)', background: selectedMembers.includes(u._id) ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(u._id) || u._id === user.id}
                        disabled={u._id === user.id}
                        onChange={() => toggleMember(u._id)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <div className="avatar">{getInitials(u.name)}</div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{u.name} {u._id === user.id ? '(You)' : ''}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email} · {u.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid-3 stagger">
          {projects.map(project => (
            <Link to={`/projects/${project._id}/tasks`} key={project._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-light)' }}>{project.name}</h3>
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '4px' }} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', flex: 1, lineHeight: '1.5' }}>
                  {project.description || 'No description provided.'}
                </p>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Users size={14} />
                    {project.members?.length || 0} member{(project.members?.length || 0) !== 1 ? 's' : ''}
                  </div>
                  <div style={{ display: 'flex' }}>
                    {project.members?.slice(0, 4).map((m, i) => (
                      <div key={m._id} className="avatar" style={{ marginLeft: i > 0 ? '-8px' : '0', border: '2px solid var(--bg-color)', fontSize: '0.6rem', width: '26px', height: '26px' }} title={m.name}>
                        {getInitials(m.name)}
                      </div>
                    ))}
                    {project.members?.length > 4 && (
                      <div className="avatar" style={{ marginLeft: '-8px', border: '2px solid var(--bg-color)', fontSize: '0.6rem', width: '26px', height: '26px', background: 'rgba(255,255,255,0.1)' }}>
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card text-center" style={{ padding: '48px 24px' }}>
          <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontWeight: 600, marginBottom: '6px' }}>No projects yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isAdmin ? 'Click "New Project" to get started!' : 'You haven\'t been added to any projects yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
