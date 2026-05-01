import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Users, ArrowRight, Briefcase } from 'lucide-react';

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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProjects();
    api.get('/auth/users').then(res => setAllUsers(res.data)).catch(console.error);
  }, []);

  const toggleMember = (id) => {
    setSelectedMembers(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name, description, members: [...new Set([...selectedMembers, user.id])] });
      setShowModal(false); setName(''); setDescription(''); setSelectedMembers([]);
      fetchProjects();
    } catch (err) { console.error(err); }
  };

  const getInitials = (n) => n?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) return <div className="loading-page"><div className="spinner"></div><span>Loading projects...</span></div>;

  return (
    <div className="slide-up">
      <div className="flex-between mb-3">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Projects</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '3px' }}>
            {isAdmin ? 'Manage all projects and teams' : 'Projects you are a member of'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> New Project
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content card">
            <h3 style={{ fontWeight: 700, marginBottom: '18px' }}>Create New Project</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" className="form-control" placeholder="e.g. Website Redesign" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" placeholder="Brief description..." value={description} onChange={e => setDescription(e.target.value)} rows={3}></textarea>
              </div>
              <div className="form-group">
                <label>Team Members</label>
                <div style={{ maxHeight: '170px', overflowY: 'auto', background: 'var(--c1)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px' }}>
                  {allUsers.map(u => (
                    <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px', borderRadius: '6px', cursor: 'pointer', background: selectedMembers.includes(u._id) ? 'var(--c4)' : 'transparent' }}>
                      <input type="checkbox" checked={selectedMembers.includes(u._id) || u._id === user.id} disabled={u._id === user.id}
                        onChange={() => toggleMember(u._id)} style={{ accentColor: 'var(--c7)' }} />
                      <div className="avatar">{getInitials(u.name)}</div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{u.name} {u._id === user.id ? '(You)' : ''}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email} · {u.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '9px', justifyContent: 'flex-end', marginTop: '18px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length > 0 ? (
        <div className="grid-3">
          {projects.map(project => (
            <Link to={`/projects/${project._id}/tasks`} key={project._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card card-clickable" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{project.name}</h3>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '3px' }} />
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.83rem', marginBottom: '14px', flex: 1, lineHeight: '1.5' }}>
                  {project.description || 'No description provided.'}
                </p>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <Users size={13} />
                    {project.members?.length || 0} member{(project.members?.length || 0) !== 1 ? 's' : ''}
                  </div>
                  <div style={{ display: 'flex' }}>
                    {project.members?.slice(0, 4).map((m, i) => (
                      <div key={m._id} className="avatar" style={{ marginLeft: i > 0 ? '-7px' : '0', border: '2px solid var(--bg)', fontSize: '0.58rem', width: '24px', height: '24px' }} title={m.name}>
                        {getInitials(m.name)}
                      </div>
                    ))}
                    {project.members?.length > 4 && (
                      <div className="avatar" style={{ marginLeft: '-7px', border: '2px solid var(--bg)', fontSize: '0.58rem', width: '24px', height: '24px', background: 'var(--c4)' }}>
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
        <div className="card text-center" style={{ padding: '44px 20px' }}>
          <Briefcase size={36} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
          <h3 style={{ fontWeight: 600, marginBottom: '5px' }}>No projects yet</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>
            {isAdmin ? 'Click "New Project" to get started.' : 'You haven\'t been added to any projects yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
