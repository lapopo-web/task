import { useState } from 'react';
import { tasksApi } from '../api/tasks';

const EMPTY = { title: '', description: '', priority: 'medium', status: 'todo', due_date: '' };

export function TaskCreate({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);

    const fieldErrors = {};
    if (!form.title.trim()) fieldErrors.title = 'Title is required';
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const body = { ...form };
      if (!body.due_date) delete body.due_date;
      const task = await tasksApi.create(body);
      onCreated(task);
      setForm(EMPTY);
    } catch (err) {
      if (err.details) {
        const map = {};
        err.details.forEach((d) => { map[d.field] = d.message; });
        setErrors(map);
      } else {
        setApiError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}>New Task</h2>

      <div>
        <label htmlFor="title" style={{ display: 'block', fontSize: 'var(--font-sm)', marginBottom: 4 }}>
          Title <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Task title"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <span id="title-error" role="alert" style={{ color: 'var(--color-danger)', fontSize: 'var(--font-sm)' }}>
            {errors.title}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="description" style={{ display: 'block', fontSize: 'var(--font-sm)', marginBottom: 4 }}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Optional description"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
        <div>
          <label htmlFor="priority" style={{ display: 'block', fontSize: 'var(--font-sm)', marginBottom: 4 }}>Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" style={{ display: 'block', fontSize: 'var(--font-sm)', marginBottom: 4 }}>Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label htmlFor="due_date" style={{ display: 'block', fontSize: 'var(--font-sm)', marginBottom: 4 }}>Due Date</label>
          <input id="due_date" name="due_date" type="date" value={form.due_date} onChange={handleChange} />
        </div>
      </div>

      {apiError && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 'var(--font-sm)' }}>{apiError}</p>}

      <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
        {loading ? 'Creating…' : 'Create Task'}
      </button>
    </form>
  );
}
