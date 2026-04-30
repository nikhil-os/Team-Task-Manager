import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Plus, ArrowLeft } from 'lucide-react';

export default function Tasks() {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [projectDetails, setProjectDetails] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'Admin';

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    api.get('/projects').then(res => {
      const p = res.data.find(proj => proj._id === projectId);
      if (p) setProjectDetails(p);
    });
  }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { title, description, projectId, status });
      setShowModal(false);
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Error updating status or not authorized');
    }
  };

  const getStatusBadge = (s) => {
    if (s === 'To Do') return <span className="badge badge-todo">To Do</span>;
    if (s === 'In Progress') return <span className="badge badge-progress">In Progress</span>;
    if (s === 'Done') return <span className="badge badge-done">Done</span>;
    return null;
  };

  return (
    <div>
      <Link to="/projects" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '16px' }}>
        <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Back to Projects
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>{projectDetails ? `${projectDetails.name} - Tasks` : 'Project Tasks'}</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} style={{ marginRight: '8px' }} /> Add Task
          </button>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 className="mb-3">Add Task</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows={3}></textarea>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn" style={{ background: 'transparent', color: 'var(--text-primary)' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid-3">
        {['To Do', 'In Progress', 'Done'].map(colStatus => (
          <div key={colStatus} style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {colStatus} 
              <span style={{ background: 'var(--card-bg)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>
                {tasks.filter(t => t.status === colStatus).length}
              </span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.filter(t => t.status === colStatus).map(task => (
                <div key={task._id} className="glass-card" style={{ padding: '16px' }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{task.title}</h5>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{task.description}</p>
                  
                  <select 
                    className="form-control" 
                    style={{ padding: '6px', fontSize: '0.8rem' }}
                    value={task.status}
                    onChange={(e) => updateStatus(task._id, e.target.value)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
