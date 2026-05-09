import { useState } from 'react';
import { authApi } from '../api/auth';

export function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
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
    setLoading(true);
    try {
      const data = mode === 'login'
        ? await authApi.login({ email: form.email, password: form.password })
        : await authApi.signup(form);
      onAuth(data);
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

  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 4 };
  const labelStyle = { fontSize: 'var(--font-sm)', fontWeight: 500 };
  const errStyle = { color: 'var(--color-danger)', fontSize: 'var(--font-sm)' };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
        width: '100%',
        maxWidth: 400,
        boxShadow: 'var(--shadow-md)',
      }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
          {mode === 'login' ? 'Sign in to TaskFlow' : 'Create your account'}
        </h1>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {mode === 'signup' && (
            <>
              <div style={fieldStyle}>
                <label htmlFor="name" style={labelStyle}>Full name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Alice Martin" aria-invalid={!!errors.name} />
                {errors.name && <span role="alert" style={errStyle}>{errors.name}</span>}
              </div>
              <div style={fieldStyle}>
                <label htmlFor="orgName" style={labelStyle}>Organization name</label>
                <input id="orgName" name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="Acme Corp" aria-invalid={!!errors.organizationName} />
                {errors.organizationName && <span role="alert" style={errStyle}>{errors.organizationName}</span>}
              </div>
            </>
          )}

          <div style={fieldStyle}>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="alice@example.com" aria-invalid={!!errors.email} />
            {errors.email && <span role="alert" style={errStyle}>{errors.email}</span>}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" aria-invalid={!!errors.password} />
            {errors.password && <span role="alert" style={errStyle}>{errors.password}</span>}
          </div>

          {apiError && <p role="alert" style={errStyle}>{apiError}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); setApiError(null); }}
            style={{ background: 'none', color: 'var(--color-primary)', padding: 0, fontWeight: 500 }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  );
}
