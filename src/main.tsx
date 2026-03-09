import * as Sentry from '@sentry/react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorFallback } from "./components/ErrorFallback.tsx";

// ── Sentry initialisation ─────────────────────────────────
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const APP_ENV = (import.meta.env.VITE_APP_ENV as string | undefined) ?? 'development';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
      }),
    ],
    // Performance: 10 % of transactions
    tracesSampleRate: 0.1,
    // Replays: 10 % of sessions, 100 % when error is captured
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Suppress noisy Supabase auth-refresh and localhost noise
    ignoreErrors: [
      'AuthSessionMissingError',
      'Network request failed',
      'Failed to fetch',
      'Load failed',
    ],
    denyUrls: [
      /localhost/,
      /127\.0\.0\.1/,
    ],
  });
}

// ── Global unhandled-rejection capture ────────────────────
window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason);
});

// ── App mount ─────────────────────────────────────────────
createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary
    fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}
  >
    <App />
  </Sentry.ErrorBoundary>
);
