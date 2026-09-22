import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled Application Error in ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/30">
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Something went wrong</h1>
                <p className="text-xs text-slate-400">JS Constructions Application encountered a runtime error</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-700/60 rounded-2xl p-4 font-mono text-xs text-rose-300 overflow-x-auto max-h-48">
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>

            {this.state.errorInfo?.componentStack && (
              <details className="text-xs text-slate-400 bg-slate-900/60 rounded-xl p-3 border border-slate-700/40">
                <summary className="cursor-pointer font-semibold text-slate-300 hover:text-white">
                  Component Stack Trace
                </summary>
                <pre className="mt-2 text-[11px] overflow-x-auto text-slate-400 font-mono">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleReset}
                className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
