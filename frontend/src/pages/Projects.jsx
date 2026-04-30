import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'Admin';

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (isAdmin) {
      api.get('/auth/users').then(res => setAllUsers(res.data)).catch(console.error);
    }
  }, [isAdmin]);

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Ensure the Admin who creates it is always a member
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Projects</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} style={{ marginRight: '8px' }} /> New Project
          </button>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 className="mb-3">Create Project</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows={3}></textarea>
              </div>
              <div className="form-group">
                <label>Assign Members</label>
                <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px' }}>
                  {allUsers.map(u => (
                    <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedMembers.includes(u._id)} 
                        onChange={() => toggleMember(u._id)} 
                      />
                      <span style={{ fontSize: '0.9rem' }}>{u.name} ({u.role})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn" style={{ background: 'transparent', color: 'var(--text-primary)' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid-3">
        {projects.map(project => (
          <Link to={`/projects/${project._id}/tasks`} key={project._id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '8px', color: 'var(--primary)' }}>{project.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', flex: 1 }}>{project.description || 'No description provided.'}</p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                Members: {project.members?.length || 0}
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && <p>No projects found.</p>}
      </div>
    </div>
  );
}
