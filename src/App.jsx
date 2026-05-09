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

  if (!authChecked) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading…</div>;
  if (!user) return <AuthForm onAuth={setUser} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--space-4) var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--font-xl)', color: 'var(--color-primary)' }}>TaskFlow</span>
        <nav style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button
            className="btn-primary"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? 'Cancel' : '+ New Task'}
          </button>
          <button onClick={handleLogout} style={{ background: 'none', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
            Logout
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        {showCreate && (
          <section style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <TaskCreate onCreated={handleTaskCreated} />
          </section>
        )}
        <TaskList key={refreshKey} />
      </main>
    </div>
  );
}
