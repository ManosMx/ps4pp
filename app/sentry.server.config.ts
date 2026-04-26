// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b9bfa54649d9b00164e5264940466a80@o4511285788016640.ingest.de.sentry.io/4511285798633552",

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  includeLocalVariables: true,

  enableLogs: true,
  sendDefaultPii: true,
});
