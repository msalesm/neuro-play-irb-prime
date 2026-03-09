/**
 * Monitoring abstraction — single import point for all error tracking.
 * Never import @sentry/react directly from application code; use this module.
 */
import * as Sentry from '@sentry/react';

/**
 * Log a structured breadcrumb event (user actions, navigation, feature usage).
 */
export function logEvent(name: string, data?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    category: 'app',
    message: name,
    data,
    level: 'info',
  });
}

/**
 * Capture an error with optional additional context.
 */
export function logError(error: Error | unknown, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context as Record<string, unknown>);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}
