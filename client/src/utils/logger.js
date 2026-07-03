let sentryEnabled = false;

export function initErrorMonitoring() {
}

export function setSentryEnabled(enabled) {
  sentryEnabled = enabled;
}

export function logError(error, context = {}) {
  console.error('[ErrorBoundary]', error?.message || error, context);
  if (sentryEnabled && typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
}

export function logWarn(message, context = {}) {
  console.warn('[Warn]', message, context);
}

export function logInfo(message, context = {}) {
  console.info('[Info]', message, context);
}
