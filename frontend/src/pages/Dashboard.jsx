import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Briefcase, CheckCircle2, Clock, ListTodo, Users, ArrowRight, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    api.get('/dashboard').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return (
    <div className="loading-page">
      <div className="spinner"></div>
      <span>Loading dashboard...</span>
    </div>
  );

  const completionRate = stats.tasksCount > 0
    ? Math.round((stats.tasksByStatus['Done'] / stats.tasksCount) * 100)
    : 0;

  const getStatusBadge = (s) => {
    if (s === 'To Do') return <span className="badge badge-todo">To Do</span>;
    if (s === 'In Progress') return <span className="badge badge-progress">In Progress</span>;
    if (s === 'Done') return <span className="badge badge-done">Done</span>;
    return null;
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  return (
    <div className="slide-up">
      <div className="flex-between mb-3">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Welcome back, {user?.name}! Here's what's happening.
          </p>
        </div>
        <Link to="/projects" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
          View Projects <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 mb-4 stagger">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.projectsCount}</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' }}>
            <ListTodo size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.tasksCount}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.tasksByStatus['Done'] || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.overdueCount}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      <div className="grid-2 stagger">
        {/* Progress Section */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Task Progress</h3>

          <div style={{ marginBottom: '16px' }}>
            <div className="flex-between mb-1">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Completion Rate</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--success)' }}>{completionRate}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${completionRate}%`, background: 'linear-gradient(90deg, var(--success), #34d399)' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {['To Do', 'In Progress', 'Done'].map(status => {
              const count = stats.tasksByStatus[status] || 0;
              const pct = stats.tasksCount > 0 ? Math.round((count / stats.tasksCount) * 100) : 0;
              const colors = {
                'To Do': '#94a3b8',
                'In Progress': 'var(--warning)',
                'Done': 'var(--success)'
              };
              return (
                <div key={status}>
                  <div className="flex-between" style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{status}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: colors[status] }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {isAdmin && stats.memberCount > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stats.memberCount} team members across all projects</span>
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Recent Activity</h3>
          {stats.recentTasks && stats.recentTasks.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTasks.map(task => (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        {task.assignedTo}
                        {task.dueDate && (
                          <>
                            <span>·</span>
                            <Calendar size={10} />
                            <span style={{ color: isOverdue(task.dueDate) && task.status !== 'Done' ? 'var(--danger)' : 'inherit' }}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{task.projectName}</td>
                    <td>{getStatusBadge(task.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '32px 0' }}>
              No tasks yet. Create a project and add tasks to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
