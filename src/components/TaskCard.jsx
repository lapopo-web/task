import { useState } from 'react';
import { tasksApi } from '../api/tasks';

/* ── Metadata maps ── */
const PRIORITY_META = {
  low:    { label: 'Low',    color: 'var(--color-priority-low)',    bg: 'var(--color-priority-low-bg)',    border: '#6ee7b7' },
  medium: { label: 'Medium', color: 'var(--color-priority-medium)', bg: 'var(--color-priority-medium-bg)', border: '#fcd34d' },
  high:   { label: 'High',   color: 'var(--color-priority-high)',   bg: 'var(--color-priority-high-bg)',   border: '#fca5a5' },
};

const STATUS_META = {
  todo:        { label: 'To Do',       color: 'var(--color-todo)',        bg: 'var(--color-todo-bg)',        icon: '○' },
  in_progress: { label: 'In Progress', color: 'var(--color-in-progress)', bg: 'var(--color-in-progress-bg)', icon: '◑' },
  done:        { label: 'Done',        color: 'var(--color-done)',        bg: 'var(--color-done-bg)',        icon: '●' },
};

const STATUS_CYCLE = { todo: 'in_progress', in_progress: 'done', done: 'todo' };

export function TaskCard({ task, onUpdate, onDelete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [hovered, setHovered] = useState(false);

  const priority = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;
  const status   = STATUS_META[task.status]     ?? STATUS_META.todo;

  async function cycleStatus() {
    const next = STATUS_CYCLE[task.status] ?? 'todo';
    setLoading(true); setError(null);
    try {
      const updated = await tasksApi.update(task.id, { status: next });
      onUpdate(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return;
    setLoading(true);
    try {
      await tasksApi.delete(task.id);
      onDelete(task.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${priority.color}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-5)',
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all var(--transition-base)',
        display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        opacity: loading ? 0.65 : 1,
        cursor: 'default',
      }}
    >
      {/* Top row: title + priority badge */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <h3 style={{
          fontSize: 'var(--font-base)', fontWeight: 700,
          color: task.status === 'done' ? 'var(--color-text-subtle)' : 'var(--color-text)',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          lineHeight: 1.4, flex: 1,
        }}>
          {task.title}
        </h3>

        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          background: priority.bg,
          color: priority.color,
          fontSize: 'var(--font-xs)', fontWeight: 700,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          border: `1px solid ${priority.border}`,
          flexShrink: 0,
        }}>
          {task.priority}
        </span>
      </header>

      {/* Description */}
      {task.description && (
        <p style={{
          fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)',
          lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {task.description}
        </p>
      )}

      {/* Footer row: status pill + due date + delete */}
      <footer style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
        {/* Clickable status pill */}
        <button
          onClick={cycleStatus}
          disabled={loading}
          title="Click to advance status"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: status.bg,
            color: status.color,
            border: 'none',
            fontSize: 'var(--font-xs)', fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'opacity var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <span>{status.icon}</span>
          {status.label}
        </button>

        {/* Due date */}
        {task.due_date && (
          <time style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 'var(--font-xs)', fontWeight: 500,
            color: isOverdue ? 'var(--color-danger)' : 'var(--color-text-muted)',
            background: isOverdue ? 'var(--color-danger-light)' : 'transparent',
            padding: isOverdue ? '3px 8px' : '3px 0',
            borderRadius: 'var(--radius-full)',
          }}>
            <span>📅</span>
            {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            {isOverdue && <span style={{ fontWeight: 700 }}> · Overdue</span>}
          </time>
        )}

        {/* Spacer */}
        <span style={{ flex: 1 }} />

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={loading}
          aria-label="Delete task"
          title="Delete task"
          style={{
            background: 'none',
            border: 'none',
            padding: '4px 6px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-subtle)',
            fontSize: 15, lineHeight: 1,
            cursor: 'pointer',
            opacity: hovered ? 1 : 0,
            transition: 'opacity var(--transition-fast), color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-subtle)')}
        >
          🗑
        </button>
      </footer>

      {error && (
        <p role="alert" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-danger)', fontWeight: 500 }}>
          {error}
        </p>
      )}
    </article>
  );
}
