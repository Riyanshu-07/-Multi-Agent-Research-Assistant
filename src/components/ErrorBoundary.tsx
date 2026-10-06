import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('research_assistant_theme');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 selection:bg-rose-500/30">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-center space-y-5 ring-1 ring-white/10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                System Interface Re-stabilizing
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                A browser environment restriction was intercepted. Multi-Agent Research Assistant is ready to resume normal operations.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 text-left overflow-x-auto max-h-32">
              {this.state.error?.message || 'Recoverable interface event'}
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Resume & Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
