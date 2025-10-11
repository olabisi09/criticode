import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details to console
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error details:", errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // In production, you might want to log this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: Log to error service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <Card className="text-center p-8">
              <div className="mb-6">
                <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground text-lg">
                  We apologize for the inconvenience. An unexpected error has
                  occurred.
                </p>
              </div>

              {/* Error details (only in development) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
                  <h3 className="font-semibold text-destructive mb-2">
                    Error Details (Development Mode)
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Error Message:
                      </p>
                      <p className="text-sm font-mono bg-muted p-2 rounded text-destructive">
                        {this.state.error.message}
                      </p>
                    </div>

                    {this.state.error.stack && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Stack Trace:
                        </p>
                        <pre className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto text-muted-foreground max-h-32 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}

                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Component Stack:
                        </p>
                        <pre className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto text-muted-foreground max-h-32 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                  variant="primary"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                  variant="secondary"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>

                {/* Reset button for development */}
                {import.meta.env.DEV && (
                  <Button
                    onClick={this.handleReset}
                    variant="secondary"
                    size="sm"
                  >
                    Reset Error Boundary
                  </Button>
                )}
              </div>

              {/* Additional help */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  If this problem persists, please try:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Refreshing the page</li>
                  <li>• Clearing your browser cache</li>
                  <li>• Trying a different browser</li>
                  <li>• Checking your internet connection</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

// Functional component wrapper for easier usage with hooks
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  fallback,
  onError,
}) => {
  // Create a class component instance that can call the onError callback
  class ErrorBoundaryWithCallback extends ErrorBoundary {
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
      super.componentDidCatch(error, errorInfo);

      // Call the custom onError callback if provided
      if (onError) {
        onError(error, errorInfo);
      }
    }
  }

  return (
    <ErrorBoundaryWithCallback fallback={fallback}>
      {children}
    </ErrorBoundaryWithCallback>
  );
};

export default ErrorBoundary;
