import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b9bfa54649d9b00164e5264940466a80@o4511285788016640.ingest.de.sentry.io/4511285798633552",

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  replaysSessionSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,
  sendDefaultPii: true,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
