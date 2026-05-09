import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', fontFamily: 'monospace', background: '#fef2f2', padding: 32,
        }}>
          <div style={{
            maxWidth: 700, width: '100%',
            background: '#fff', border: '2px solid #fca5a5',
            borderRadius: 12, padding: 32, boxShadow: '0 4px 24px rgb(239 68 68 / 0.12)',
          }}>
            <h1 style={{ color: '#ef4444', fontSize: 22, marginBottom: 12 }}>⚠️ React Render Error</h1>
            <pre style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: 16, fontSize: 13, lineHeight: 1.6,
              overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              color: '#7f1d1d',
            }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => this.setState({ error: null })}
              style={{
                marginTop: 16, background: '#ef4444', color: '#fff',
                border: 'none', borderRadius: 8, padding: '8px 20px',
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
