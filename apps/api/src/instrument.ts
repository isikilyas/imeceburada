import * as Sentry from "@sentry/nestjs";

// main.ts'teki diğer tüm import'lardan önce çağrılmalı.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
