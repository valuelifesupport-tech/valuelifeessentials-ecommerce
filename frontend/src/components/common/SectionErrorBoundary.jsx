import React, { Component } from 'react';

export default class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn(`[SafeSection] Caught error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 my-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center shadow-xs">
          <p className="text-xs font-semibold text-slate-400">
            Notice: {this.props.name || 'This section'} temporarily unavailable.
          </p>
          <button 
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
