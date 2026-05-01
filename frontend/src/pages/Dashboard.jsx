import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Briefcase, CheckCircle2, Clock, ListTodo, Users, ArrowRight, Calendar, X } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [drillModal, setDrillModal] = useState(null); // { type, title, data }
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    api.get('/dashboard').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return (
    <div className="loading-page"><div className="spinner"></div><span>Loading dashboard...</span></div>
  );

  const completionRate = stats.tasksCount > 0
    ? Math.round((stats.tasksByStatus['Done'] / stats.tasksCount) * 100) : 0;

  const getStatusBadge = (s) => {
    if (s === 'To Do') return <span className="badge badge-todo">To Do</span>;
    if (s === 'In Progress') return <span className="badge badge-progress">In Progress</span>;
    if (s === 'Done') return <span className="badge badge-done">Done</span>;
    return null;
  };

  const isOverdue = (d) => d && new Date(d) < new Date();

  const openProjectsDrill = () => {
    setDrillModal({
      type: 'projects', title: 'Projects Overview',
      data: stats.projectSummaries || []
    });
  };

  const openTasksDrill = () => {
    setDrillModal({
      type: 'tasks', title: 'All Tasks by Status',
      data: stats.tasksByStatusDetail || {}
    });
  };

  const openCompletedDrill = () => {
    setDrillModal({
      type: 'completed', title: 'Completed Tasks',
      data: stats.completedTasks || []
    });
  };

  const openOverdueDrill = () => {
    setDrillModal({
      type: 'overdue', title: 'Overdue Tasks',
      data: stats.overdueTasks || []
    });
  };

  return (
    <div className="slide-up">
      <div className="flex-between mb-3">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '3px' }}>
            Welcome back, {user?.name}.
          </p>
        </div>
        <Link to="/projects" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
          View Projects <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── Clickable Stat Cards ── */}
      <div className="grid-4 mb-4">
        <div className="card card-clickable stat-card" onClick={openProjectsDrill}>
          <div className="stat-icon"><Briefcase size={21} /></div>
          <div>
            <div className="stat-value">{stats.projectsCount}</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>
        <div className="card card-clickable stat-card" onClick={openTasksDrill}>
          <div className="stat-icon"><ListTodo size={21} /></div>
          <div>
            <div className="stat-value">{stats.tasksCount}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="card card-clickable stat-card" onClick={openCompletedDrill}>
          <div className="stat-icon"><CheckCircle2 size={21} /></div>
          <div>
            <div className="stat-value">{stats.tasksByStatus['Done'] || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="card card-clickable stat-card" onClick={openOverdueDrill}>
          <div className="stat-icon"><Clock size={21} /></div>
          <div>
            <div className="stat-value">{stats.overdueCount}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* ── Task Progress ── */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '18px' }}>Task Progress</h3>
          <div style={{ marginBottom: '14px' }}>
            <div className="flex-between mb-1">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completion Rate</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>{completionRate}%</span>
            </div>
            <div className="progress-bg">
              <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {['To Do', 'In Progress', 'Done'].map(status => {
              const count = stats.tasksByStatus[status] || 0;
              const pct = stats.tasksCount > 0 ? Math.round((count / stats.tasksCount) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex-between" style={{ marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{status}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          {isAdmin && stats.memberCount > 0 && (
            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Users size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{stats.memberCount} team members</span>
            </div>
          )}
        </div>

        {/* ── Recent Activity ── */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>Recent Activity</h3>
          {stats.recentTasks && stats.recentTasks.length > 0 ? (
            <table className="data-table">
              <thead><tr><th>Task</th><th>Project</th><th>Status</th></tr></thead>
              <tbody>
                {stats.recentTasks.map(task => (
                  <tr key={task._id} style={{ cursor: 'pointer' }} onClick={() => task.projectId && navigate(`/projects/${task.projectId}/tasks`)}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                        {task.assignedTo}
                        {task.dueDate && (<><span>·</span><Calendar size={9} />
                          <span style={{ color: isOverdue(task.dueDate) && task.status !== 'Done' ? '#d4a0a0' : 'inherit' }}>
                            {new Date(task.dueDate).toLocaleDateString()}</span></>)}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{task.projectName}</td>
                    <td>{getStatusBadge(task.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '28px 0' }}>
              No tasks yet. Create a project and add tasks to get started.
            </p>
          )}
        </div>
      </div>

      {/* ── Drill-Down Modal ── */}
      {drillModal && (
        <div className="modal-overlay" onClick={() => setDrillModal(null)}>
          <div className="card drill-modal" onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-2">
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{drillModal.title}</h3>
              <button onClick={() => setDrillModal(null)} className="btn btn-sm" style={{ background: 'transparent', padding: '4px', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Projects drill-down */}
            {drillModal.type === 'projects' && (
              <div className="drill-list">
                {drillModal.data.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>No projects found.</p>}
                {drillModal.data.map(p => (
                  <div key={p._id} className="drill-item" style={{ cursor: 'pointer' }} onClick={() => { setDrillModal(null); navigate(`/projects/${p._id}/tasks`); }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className="drill-item-sub">{p.memberCount} members · {p.taskCount} tasks</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{p.taskCount > 0 ? Math.round((p.doneCount / p.taskCount) * 100) : 0}%</div>
                      <div className="drill-item-sub">complete</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks by status drill-down */}
            {drillModal.type === 'tasks' && (
              <div>
                {['To Do', 'In Progress', 'Done'].map(status => {
                  const items = drillModal.data[status] || [];
                  return (
                    <div key={status} style={{ marginBottom: '16px' }}>
                      <div className="flex-between" style={{ marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{status}</span>
                        {getStatusBadge(status)}
                      </div>
                      {items.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', paddingLeft: '8px' }}>None</p>}
                      {items.map(t => (
                        <div key={t._id} className="drill-item" style={{ cursor: 'pointer' }} onClick={() => { setDrillModal(null); navigate(`/projects/${t.projectId}/tasks`); }}>
                          <div>
                            <div style={{ fontWeight: 500 }}>{t.title}</div>
                            <div className="drill-item-sub">{t.projectName} · {t.assignedTo}</div>
                          </div>
                          <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed drill-down */}
            {drillModal.type === 'completed' && (
              <div className="drill-list">
                {drillModal.data.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>No completed tasks.</p>}
                {drillModal.data.map(t => (
                  <div key={t._id} className="drill-item" style={{ cursor: 'pointer' }} onClick={() => { setDrillModal(null); navigate(`/projects/${t.projectId}/tasks`); }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.title}</div>
                      <div className="drill-item-sub">{t.projectName} · {t.assignedTo}</div>
                    </div>
                    <span className="badge badge-done">Done</span>
                  </div>
                ))}
              </div>
            )}

            {/* Overdue drill-down */}
            {drillModal.type === 'overdue' && (
              <div className="drill-list">
                {drillModal.data.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>No overdue tasks.</p>}
                {drillModal.data.map(t => (
                  <div key={t._id} className="drill-item" style={{ cursor: 'pointer' }} onClick={() => { setDrillModal(null); navigate(`/projects/${t.projectId}/tasks`); }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.title}</div>
                      <div className="drill-item-sub">{t.projectName} · {t.assignedTo}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-overdue">Overdue</span>
                      {t.dueDate && <div className="drill-item-sub" style={{ color: '#d4a0a0' }}>{new Date(t.dueDate).toLocaleDateString()}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
