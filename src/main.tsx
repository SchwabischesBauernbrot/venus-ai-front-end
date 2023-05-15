import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import loadable from "@loadable/component";

import "antd/dist/reset.css";
import "antd-css-utilities/utility.min.css";
import "./global.scss";
import { QueryClient, QueryClientProvider } from "react-query";

(window as any).prerenderReady = false;

Sentry.init({
  dsn: "https://41424acd7c684f2583f8620ba35ffd35@o4505098397483008.ingest.sentry.io/4505098399121408",
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Reduce server load lol
      refetchInterval: false,
      refetchOnReconnect: false,
    },
  },
});

const App = loadable(() => import("./App"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
