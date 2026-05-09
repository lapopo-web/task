import { useState, useEffect } from 'react';
import { tasksApi } from '../api/tasks';
import { TaskCard } from './TaskCard';

const TABS = [
  { value: '',            label: 'All' },
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
];

export function TaskList() {
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [statusFilter, setFilter]   = useState('');

  async function fetchTasks() {
    setLoading(true); setError(null);
    try {
      const filters = statusFilter ? { status: statusFilter } : {};
      const result  = await tasksApi.list(filters);
      setTasks(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTasks(); }, [statusFilter]);

  function handleUpdate(updated) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDelete(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  /* Stats */
  const counts = {
    all:         tasks.length,
    todo:        tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done:        tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <section aria-label="Task list">
      {/* ── Section header ── */}
      <header style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
            Tasks
          </h2>
          {!loading && (
            <span style={{
              fontSize: 'var(--font-sm)', fontWeight: 600,
              color: 'var(--color-text-muted)',
              background: 'var(--color-border-subtle)',
              padding: '2px 10px', borderRadius: 'var(--radius-full)',
            }}>
              {counts.all}
            </span>
          )}
        </div>

        {/* Stats bar */}
        {!loading && tasks.length > 0 && (
          <div style={{
            display: 'flex', gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            flexWrap: 'wrap',
          }}>
            <StatPill label="To Do"       count={counts.todo}        color="var(--color-todo)"        bg="var(--color-todo-bg)" />
            <StatPill label="In Progress" count={counts.in_progress} color="var(--color-in-progress)" bg="var(--color-in-progress-bg)" />
            <StatPill label="Done"        count={counts.done}        color="var(--color-done)"        bg="var(--color-done-bg)" />
          </div>
        )}

        {/* Filter tabs */}
        <nav
          role="tablist"
          aria-label="Filter tasks by status"
          style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}
        >
          {TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.value)}
                style={{
                  background: active ? 'var(--gradient-brand)' : 'var(--color-surface)',
                  color: active ? '#fff' : 'var(--color-text-muted)',
                  border: active ? 'none' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '5px 16px',
                  fontSize: 'var(--font-sm)', fontWeight: 600,
                  boxShadow: active ? '0 2px 8px rgb(99 102 241 / 0.3)' : 'var(--shadow-xs)',
                  transition: 'all var(--transition-base)',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} aria-live="polite" aria-label="Loading tasks">
          {[1, 2, 3].map((n) => (
            <div key={n} style={{
              height: 96,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(90deg, var(--color-border) 0%, var(--color-border-subtle) 50%, var(--color-border) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s ease infinite',
            }} />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div role="alert" style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-4) var(--space-5)',
          background: 'var(--color-danger-light)',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--color-danger)',
          fontSize: 'var(--font-sm)', fontWeight: 500,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700 }}>Failed to load tasks</div>
            <div style={{ opacity: 0.8 }}>{error}</div>
          </div>
          <button
            onClick={fetchTasks}
            style={{
              marginLeft: 'auto', background: 'var(--color-danger)',
              color: '#fff', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '6px 14px',
              fontSize: 'var(--font-sm)', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && tasks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-12) var(--space-4)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '2px dashed var(--color-border)',
        }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto var(--space-4)',
            background: 'var(--gradient-brand-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            {statusFilter ? '🔍' : '✦'}
          </div>
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            {statusFilter ? `No ${statusFilter.replace('_', ' ')} tasks` : 'No tasks yet'}
          </h3>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
            {statusFilter
              ? 'Try a different filter or create a new task.'
              : 'Click "New Task" above to create your first one.'}
          </p>
        </div>
      )}

      {/* ── Task list ── */}
      {!loading && !error && tasks.length > 0 && (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {tasks.map((task, i) => (
            <li
              key={task.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
            >
              <TaskCard task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ── Stat pill ── */
function StatPill({ label, count, color, bg }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px',
      borderRadius: 'var(--radius-full)',
      background: bg, color,
      fontSize: 'var(--font-xs)', fontWeight: 700,
    }}>
      <span style={{
        width: 6, height: 6,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }} />
      {count} {label}
    </div>
  );
}
