import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "antd/dist/reset.css";
import "antd-css-utilities/utility.min.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConfigProvider, theme } from "antd";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { CreateCharacter } from "./pages/Character/pages/CreateCharacter";
import Home from "./pages/Home";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile/Profile";
import { Register } from "./pages/Register";
import { ViewCharacter } from "./pages/Character/pages/ViewCharacter";
import { EditCharacter } from "./pages/Character/pages/EditCharacter";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/create_char",
        element: <CreateCharacter />,
      },
      {
        path: "/edit_char/:characterId",
        element: <EditCharacter />,
      },
      {
        path: "/character/:characterId",
        element: <ViewCharacter />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
