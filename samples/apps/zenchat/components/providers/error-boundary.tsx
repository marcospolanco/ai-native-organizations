"use client";

import React from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary as SentryErrorBoundary } from "@sentry/nextjs";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

const DefaultFallback: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
    <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
      Something went wrong
    </h2>
    <p className="text-red-700 dark:text-red-300 text-center mb-4">
      An unexpected error occurred. Our team has been notified.
    </p>
    <button
      onClick={reset}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      Try again
    </button>
  </div>
);

export function ErrorBoundary({ children, fallback = DefaultFallback, onError }: ErrorBoundaryProps) {
  const handleError = React.useCallback((capturedError: Error, errorInfo: React.ErrorInfo) => {
    // Capture the error in Sentry
    Sentry.captureException(capturedError, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Call custom error handler if provided
    if (onError) {
      onError(capturedError, errorInfo);
    }
  }, [onError]);

  return (
    <SentryErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </SentryErrorBoundary>
  );
}