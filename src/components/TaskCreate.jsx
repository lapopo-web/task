import { useState } from 'react';
import { tasksApi } from '../api/tasks';

const EMPTY = { title: '', description: '', priority: 'medium', status: 'todo', due_date: '' };

const PRIORITY_OPTS = [
  { value: 'low',    label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high',   label: '🔴 High' },
];

const STATUS_OPTS = [
  { value: 'todo',        label: '○ To Do' },
  { value: 'in_progress', label: '◑ In Progress' },
  { value: 'done',        label: '● Done' },
];

export function TaskCreate({ onCreated }) {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);

    const fieldErrors = {};
    if (!form.title.trim()) fieldErrors.title = 'Title is required';
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

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
    <form onSubmit={handleSubmit} noValidate>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h2 style={{
          fontSize: 'var(--font-xl)', fontWeight: 800,
          letterSpacing: '-0.02em', color: 'var(--color-text)',
        }}>
          New task
        </h2>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', marginTop: 2 }}>
          Fill in the details below to add it to your board.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Title */}
        <Field label="Title" required error={errors.title}>
          <input
            id="title" name="title" value={form.title} onChange={handleChange}
            placeholder="What needs to be done?" aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
            style={{ fontSize: 'var(--font-base)', fontWeight: 500 }}
          />
          {errors.title && (
            <span id="title-error" role="alert" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-danger)', fontWeight: 500 }}>
              {errors.title}
            </span>
          )}
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            id="description" name="description" value={form.description}
            onChange={handleChange} rows={3}
            placeholder="Add more context… (optional)"
            style={{ resize: 'vertical', minHeight: 80 }}
          />
        </Field>

        {/* 3-col row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
          <Field label="Priority">
            <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          <Field label="Status">
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          <Field label="Due date">
            <input id="due_date" name="due_date" type="date" value={form.due_date} onChange={handleChange} />
          </Field>
        </div>

        {apiError && (
          <div role="alert" style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-danger-light)',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: 'var(--font-sm)', fontWeight: 500,
          }}>
            {apiError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button
            type="submit" className="btn-primary" disabled={loading}
            style={{ padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--font-base)' }}
          >
            {loading
              ? <><Spinner /> Creating…</>
              : <><span style={{ fontSize: 14 }}>✦</span> Create task</>}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ── Sub-components ── */
function Field({ label, required, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
        {label}
        {required && <span aria-hidden="true" style={{ color: 'var(--color-danger)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <span role="alert" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-danger)', fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14,
      border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}
