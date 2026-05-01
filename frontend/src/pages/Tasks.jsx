import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Plus, ArrowLeft, Trash2, Calendar, RefreshCw } from 'lucide-react';

export default function Tasks() {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'Admin';

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      await api.post('/tasks', {
        title, description, projectId, status,
        assignedTo: assignedTo || undefined,
        dueDate: dueDate || undefined
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate('');
      setStatus('To Do');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update status');
    } finally {
      setUpdating(null);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (s) => {
    if (s === 'To Do') return <span className="badge badge-todo">To Do</span>;
    if (s === 'In Progress') return <span className="badge badge-progress">In Progress</span>;
    if (s === 'Done') return <span className="badge badge-done">Done</span>;
    return null;
  };

  const isOverdue = (date) => date && new Date(date) < new Date();
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner"></div>
      <span>Loading tasks...</span>
    </div>
  );

  // ───────────────────────── MEMBER VIEW ─────────────────────────
  // Members see a flat list of THEIR assigned tasks with a prominent status update control
  if (!isAdmin) {
    return (
      <div className="slide-up">
        <Link to="/projects" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        <div className="mb-3">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {projectDetails?.name || 'Project'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Your assigned tasks · {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '48px 24px' }}>
            <RefreshCw size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontWeight: 600, marginBottom: '6px' }}>No tasks assigned to you yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              The Admin has not assigned any tasks to you in this project yet. Check back later.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="stagger">
            {tasks.map(task => (
              <div key={task._id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  {/* Left: Task info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{task.title}</h3>
                    {task.description && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '10px', lineHeight: '1.5' }}>{task.description}</p>
                    )}
                    <div className="task-meta">
                      <span className="task-meta-item">
                        <div className="avatar" style={{ width: '20px', height: '20px', fontSize: '0.55rem' }}>
                          {getInitials(task.assignedTo?.name || user?.name)}
                        </div>
                        Assigned to you
                      </span>
                      {task.dueDate && (
                        <span className="task-meta-item" style={{ color: isOverdue(task.dueDate) && task.status !== 'Done' ? 'var(--danger)' : 'var(--text-muted)' }}>
                          <Calendar size={12} />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate) && task.status !== 'Done' && (
                            <span className="badge badge-overdue" style={{ marginLeft: '4px', padding: '1px 6px', fontSize: '0.65rem' }}>OVERDUE</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status update control — ALWAYS visible for member */}
                  <div style={{ minWidth: '180px', textAlign: 'right' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Update Status
                    </label>
                    <select
                      className="status-select"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.9rem',
                        borderRadius: '8px',
                        background: task.status === 'Done' ? 'var(--success-bg)' : task.status === 'In Progress' ? 'var(--warning-bg)' : 'rgba(15, 23, 42, 0.7)',
                        borderColor: task.status === 'Done' ? 'rgba(16,185,129,0.4)' : task.status === 'In Progress' ? 'rgba(245,158,11,0.4)' : 'var(--border-color)',
                        color: task.status === 'Done' ? 'var(--success)' : task.status === 'In Progress' ? 'var(--warning)' : 'var(--text-primary)',
                        fontWeight: 600
                      }}
                      value={task.status}
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                      disabled={updating === task._id}
                    >
                      <option value="To Do">📋 To Do</option>
                      <option value="In Progress">⚡ In Progress</option>
                      <option value="Done">✅ Done</option>
                    </select>
                    {updating === task._id && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '4px', display: 'block' }}>Saving...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ───────────────────────── ADMIN VIEW ─────────────────────────
  // Admin sees the full Kanban board + can create/delete tasks
  const columns = [
    { key: 'To Do', color: '#94a3b8' },
    { key: 'In Progress', color: 'var(--warning)' },
    { key: 'Done', color: 'var(--success)' }
  ];

  return (
    <div className="slide-up">
      <Link to="/projects" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="flex-between mb-3">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {projectDetails?.name || 'Project Tasks'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {tasks.filter(t => t.status === 'Done').length} completed
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content glass-card">
            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Create New Task</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-control" placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" placeholder="What needs to be done..." value={description} onChange={e => setDescription(e.target.value)} rows={3}></textarea>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" className="form-control" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Assign To Member</label>
                <select className="form-control" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                  <option value="">Unassigned</option>
                  {projectDetails?.members?.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Kanban Board */}
      <div className="grid-3">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="kanban-column">
              <div className="kanban-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }}></div>
                  <h4>{col.key}</h4>
                </div>
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              <div className="kanban-cards">
                {colTasks.map(task => (
                  <div key={task._id} className="task-card">
                    <div className="flex-between" style={{ marginBottom: '6px' }}>
                      <h5>{task.title}</h5>
                      <button onClick={() => deleteTask(task._id)} className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px', minWidth: 'auto' }} title="Delete task">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {task.description && <p>{task.description}</p>}

                    <div className="task-meta">
                      {task.assignedTo ? (
                        <span className="task-meta-item">
                          <div className="avatar" style={{ width: '20px', height: '20px', fontSize: '0.55rem' }}>
                            {getInitials(task.assignedTo.name)}
                          </div>
                          {task.assignedTo.name}
                        </span>
                      ) : (
                        <span className="task-meta-item" style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                      )}
                      {task.dueDate && (
                        <span className="task-meta-item" style={{ color: isOverdue(task.dueDate) && task.status !== 'Done' ? 'var(--danger)' : 'var(--text-muted)' }}>
                          <Calendar size={12} />
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate) && task.status !== 'Done' && (
                            <span className="badge badge-overdue" style={{ marginLeft: '4px', padding: '1px 6px', fontSize: '0.65rem' }}>OVERDUE</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Admin can also change status */}
                    <select
                      className="status-select"
                      style={{ marginTop: '10px', width: '100%' }}
                      value={task.status}
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                    >
                      <option value="To Do">📋 To Do</option>
                      <option value="In Progress">⚡ In Progress</option>
                      <option value="Done">✅ Done</option>
                    </select>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
