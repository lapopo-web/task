import { useState, useEffect } from 'react';
import { authApi } from './api/auth';
import { AuthForm } from './components/AuthForm';
import { TaskList } from './components/TaskList';
import { TaskCreate } from './components/TaskCreate';
import './styles/tokens.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    authApi.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  async function handleLogout() {
    await authApi.logout();
    setUser(null);
  }

  function handleTaskCreated() {
    setShowCreate(false);
    setRefreshKey((k) => k + 1);
  }

  if (!authChecked) return <LoadingScreen />;
  if (!user) return <AuthForm onAuth={setUser} />;

  const initials = user.name
    ? user.name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <header style={{
        background: 'var(--gradient-brand)',
        padding: '0 var(--space-8)',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 16px rgb(99 102 241 / 0.25)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#fff',
          }}>✦</div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 'var(--font-xl)', letterSpacing: '-0.02em' }}>
            TaskFlow
          </span>
        </div>

        {/* Actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            onClick={() => setShowCreate((v) => !v)}
            style={{
              background: showCreate ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.95)',
              color: showCreate ? '#fff' : 'var(--color-primary)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '7px 16px',
              fontWeight: 700,
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 16 }}>{showCreate ? '✕' : '+'}</span>
            {showCreate ? 'Cancel' : 'New Task'}
          </button>

          {/* User avatar + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 34, height: 34,
              background: 'rgba(255,255,255,0.25)',
              border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13,
              userSelect: 'none',
            }}>
              {initials}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.75)',
                border: 'none',
                padding: '6px 10px',
                fontSize: 'var(--font-sm)',
                fontWeight: 500,
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#fff')}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.75)')}
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, maxWidth: 860, width: '100%', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        {/* New task panel */}
        {showCreate && (
          <div className="animate-slide-down" style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <TaskCreate onCreated={handleTaskCreated} />
          </div>
        )}

        <TaskList key={refreshKey} />
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--color-bg)', gap: 'var(--space-4)',
    }}>
      <div style={{
        width: 48, height: 48,
        background: 'var(--gradient-brand)',
        borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color: '#fff',
        animation: 'spin 2s linear infinite',
      }}>✦</div>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)', fontWeight: 500 }}>
        Loading TaskFlow…
      </span>
    </div>
  );
}
