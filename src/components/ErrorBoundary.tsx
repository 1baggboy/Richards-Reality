import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  variant?: 'page' | 'section' | 'silent';
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public declare readonly props: Readonly<ErrorBoundaryProps>;
  public declare setState: (state: Partial<ErrorBoundaryState>) => void;
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const label = error?.name ? `${error.name}: ${error.message || 'Rendering error'}` : (error?.message || 'An unexpected rendering error occurred.');
    return {
      hasError: true,
      errorMessage: label
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReturnHome = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      // Ignore history errors
    }

    if (this.props.onReset) {
      this.setState({ hasError: false, errorMessage: '' });
      this.props.onReset();
      return;
    }

    if (window.location.pathname === '/' && !window.location.search && !window.location.hash) {
      this.setState({ hasError: false, errorMessage: '' });
      return;
    }

    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.variant === 'silent') {
        return null;
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isSection = this.props.variant === 'section';

      return (
        <div className={`${isSection ? 'py-20 px-4' : 'min-h-screen p-4'} bg-[#F4F7F9] flex items-center justify-center font-sans text-[#0A1D37]`}>
          <div className="max-w-lg w-full bg-white border border-gray-200 border-t-4 border-t-[#C5A02E] p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#C5A02E]/10 text-[#C5A02E]">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#C5A02E]">
                  Howard Homes LLC
                </p>
                <h1 className="font-serif font-bold text-2xl text-[#0A1D37]">
                  Unable to Display This Section
                </h1>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              We encountered a temporary issue while loading this view. You can reload the page or return to the homepage to continue browsing.
            </p>

            {this.state.errorMessage && (
              <div className="bg-slate-50 border border-gray-200 px-3 py-2 text-[11px] font-mono text-slate-600 break-words">
                {this.state.errorMessage}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReturnHome}
                className="bg-[#0A1D37] hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Home className="h-4 w-4 text-[#C5A02E]" />
                Return Home
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="bg-[#C5A02E] hover:bg-[#A68625] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
