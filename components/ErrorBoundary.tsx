import React, { Component, ErrorInfo } from 'react';

// Using React.PropsWithChildren is a good practice for components that accept children.
type Props = React.PropsWithChildren<{}>;

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  // FIX: Reverted to a constructor for state initialization. This is a more robust pattern that ensures `this.props` is available and correctly typed, resolving potential issues with class field initializers in certain TypeScript configurations.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg text-gray-200">
            <div className="text-center p-8 bg-glass-bg border border-red-500 rounded-lg">
                <h1 className="text-2xl font-orbitron text-red-400">Something went wrong.</h1>
                <p className="mt-4 text-gray-400">An unexpected error occurred. Please try refreshing the page.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/40 transition-colors"
                >
                    Refresh Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}