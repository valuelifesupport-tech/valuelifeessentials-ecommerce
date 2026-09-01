import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#0f172a', color: '#ffffff', fontFamily: 'sans-serif', minHeight: '100vh', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', color: '#ef4444', marginBottom: '16px' }}>🌱 ValueLife Essentials Application Notice</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering the store.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reload Page
          </button>
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
  </StrictMode>,
)
