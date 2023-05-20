import React from "react";
import ReactDOM from "react-dom/client";
import loadable from "@loadable/component";

import "antd/dist/reset.css";
import "antd-css-utilities/utility.min.css";
import "./global.scss";
import { QueryClient, QueryClientProvider } from "react-query";

(window as any).prerenderReady = false;

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
