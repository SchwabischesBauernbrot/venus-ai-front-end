import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "antd/dist/reset.css";
import "antd-css-utilities/utility.min.css";
import "./global.css";
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
import { PublicProfile } from "./pages/Profile/PublicProfile";

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

      // Profile and Public Profile
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/profiles/:profileId",
        element: <PublicProfile />,
      },

      // Characters
      {
        path: "/create_character",
        element: <CreateCharacter />,
      },
      {
        path: "/edit_character/:characterId",
        element: <EditCharacter />,
      },
      {
        path: "/characters/:characterId",
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
