import { useState, useEffect } from 'react';
import { tasksApi } from '../api/tasks';
import { TaskCard } from './TaskCard';

export function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  async function fetchTasks() {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      const result = await tasksApi.list(filters);
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

  return (
    <section aria-label="Task list">
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 600 }}>Tasks</h2>
        <label htmlFor="filter-status" style={{ fontSize: 'var(--font-sm)' }}>Filter:</label>
        <select
          id="filter-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </header>

      {loading && <p aria-live="polite">Loading tasks…</p>}
      {error && <p role="alert" style={{ color: 'var(--color-danger)' }}>Error: {error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>No tasks found.</p>
      )}

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
          </li>
        ))}
      </ul>
    </section>
  );
}
