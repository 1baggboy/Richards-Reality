import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public declare readonly props: Readonly<ErrorBoundaryProps>;
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering error occurred.'
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
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center p-4 font-sans text-[#0A1D37]">
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
