import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full text-center">
            <div className="text-6xl mb-4">🏝️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
            <p className="text-slate-400 mb-4">
              The tier list encountered an unexpected error. Don&apos;t worry, your rankings are still safe!
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded w-full transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full transition-colors"
              >
                Try Again
              </button>
            </div>
            {typeof window !== 'undefined' && window.location.hostname === 'localhost' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-slate-300">Error Details</summary>
                <pre className="text-xs text-red-400 mt-2 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
