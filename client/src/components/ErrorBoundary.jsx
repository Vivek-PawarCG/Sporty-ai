import { Component } from 'react';

/**
 * React Error Boundary — catches rendering errors gracefully.
 * Displays fallback UI and logs error to API.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    // Log to server
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'client_error',
        error: error.message,
        stack: errorInfo.componentStack?.slice(0, 500),
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#060b14',
          color: '#e0ffe8',
          fontFamily: "'DM Sans', sans-serif",
          padding: 20,
        }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚡</div>
            <h1 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '1.2rem',
              color: '#00e676',
              marginBottom: 8,
            }}>Something went wrong</h1>
            <p style={{ color: 'rgba(224,255,232,0.6)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
              An unexpected error occurred. Our AI systems are self-recovering.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              style={{
                padding: '10px 24px',
                background: '#00e676',
                color: '#060b14',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
