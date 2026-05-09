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
    setErrors((prev) => ({ ...prev, [name]: undefined }));
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

  function switchMode() {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrors({});
    setApiError(null);
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--color-bg)',
    }}>
      {/* ── Left: branding panel ── */}
      <div style={{
        background: 'var(--gradient-brand)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'var(--space-12)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 240, height: 240,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            marginBottom: 'var(--space-8)',
          }}>
            <div style={{
              width: 48, height: 48,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>✦</div>
            <span style={{ color: '#fff', fontSize: 'var(--font-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              TaskFlow
            </span>
          </div>

          <h1 style={{
            color: '#fff',
            fontSize: 'var(--font-3xl)',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            marginBottom: 'var(--space-4)',
          }}>
            Manage your<br />team's work,<br />beautifully.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--font-lg)', lineHeight: 1.6 }}>
            Organize tasks, track progress,<br />and ship faster — together.
          </p>

          <div style={{ marginTop: 'var(--space-10)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {['🚀 Task tracking with priorities', '📊 Real-time status updates', '👥 Built for teams of 5–50'].map((feat) => (
              <div key={feat} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-sm)',
              }}>
                <span style={{
                  width: 8, height: 8,
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: '50%', flexShrink: 0,
                }} />
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'var(--space-12)',
        background: '#fff',
      }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }} className="animate-fade-up">
          <h2 style={{
            fontSize: 'var(--font-2xl)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 6,
            color: 'var(--color-text)',
          }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-8)' }}>
            {mode === 'login'
              ? 'Sign in to continue to your workspace.'
              : 'Set up your organization and get started.'}
          </p>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {mode === 'signup' && (
              <>
                <Field label="Full name" error={errors.name}>
                  <input id="name" name="name" value={form.name} onChange={handleChange}
                    placeholder="Alice Martin" aria-invalid={!!errors.name} autoComplete="name" />
                </Field>
                <Field label="Organization name" error={errors.organizationName}>
                  <input id="orgName" name="organizationName" value={form.organizationName}
                    onChange={handleChange} placeholder="Acme Corp"
                    aria-invalid={!!errors.organizationName} />
                </Field>
              </>
            )}

            <Field label="Email address" error={errors.email}>
              <input id="email" name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="alice@example.com"
                aria-invalid={!!errors.email} autoComplete="email" />
            </Field>

            <Field label="Password" error={errors.password}
              hint={mode === 'signup' ? 'Minimum 8 characters' : undefined}>
              <input id="password" name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="••••••••"
                aria-invalid={!!errors.password} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </Field>

            {apiError && (
              <div role="alert" style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-danger-light)',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                fontSize: 'var(--font-sm)',
                fontWeight: 500,
              }}>
                {apiError}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--font-base)', width: '100%', justifyContent: 'center' }}>
              {loading
                ? <><Spinner /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode} style={{
              background: 'none', border: 'none', padding: 0,
              color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer',
              fontSize: 'var(--font-sm)', fontFamily: 'inherit',
            }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

/* ── Sub-components ── */
function Field({ label, error, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
        {label}
      </label>
      {children}
      {hint && !error && <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-subtle)' }}>{hint}</span>}
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
