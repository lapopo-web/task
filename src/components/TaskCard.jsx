import { useState } from 'react';
import { tasksApi } from '../api/tasks';

export function TaskCard({ task, onUpdate, onDelete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleStatusChange(e) {
    setLoading(true);
    setError(null);
    try {
      const updated = await tasksApi.update(task.id, { status: e.target.value });
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <article
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 600 }}>{task.title}</h3>
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
      </header>

      {task.description && (
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>{task.description}</p>
      )}

      {task.due_date && (
        <time style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
          Due: {new Date(task.due_date).toLocaleDateString()}
        </time>
      )}

      <footer style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <label htmlFor={`status-${task.id}`} style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
          Status:
        </label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          onChange={handleStatusChange}
          disabled={loading}
          style={{ width: 'auto', fontSize: 'var(--font-sm)' }}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="btn-danger"
          aria-label="Delete task"
          style={{ marginLeft: 'auto', padding: '4px 10px' }}
        >
          Delete
        </button>
      </footer>

      {error && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 'var(--font-sm)' }}>{error}</p>}
    </article>
  );
}
