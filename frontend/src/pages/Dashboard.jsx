import { useEffect, useState } from 'react';
import api from '../api';
import { Briefcase, CheckCircle2, Clock, ListTodo } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="text-center mt-4">Loading stats...</div>;

  return (
    <div>
      <h2 className="mb-3">Dashboard Overview</h2>
      
      <div className="grid-4 mb-4">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--primary)' }}>
            <Briefcase size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Projects</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.projectsCount}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(148, 163, 184, 0.2)', padding: '16px', borderRadius: '12px', color: '#cbd5e1' }}>
            <ListTodo size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Tasks</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.tasksCount}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Completed</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.tasksByStatus['Done'] || 0}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--danger)' }}>
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Overdue</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.overdueCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
