import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "antd/dist/reset.css";
import "antd-css-utilities/utility.min.css";
import "./global.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConfigProvider, App as AntdApp, theme } from "antd";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { CreateCharacter } from "./pages/Character/pages/CreateCharacter";
import Home from "./pages/Home";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile/Profile";
import { Register } from "./pages/Register";
import { ViewCharacter } from "./pages/Character/pages/ViewCharacter";
import { EditCharacter } from "./pages/Character/pages/EditCharacter";
import { PublicProfile } from "./pages/Profile/PublicProfile";
import { MyCharacters } from "./pages/Character/pages/MyCharacters";
import { ChatView } from "./pages/Chat/pages/ChatView";
import { MyChats } from "./pages/Chat/pages/MyChats";
import { TermOfUse } from "./pages/ToC/TermOfUse";
import { PrivatePolicy } from "./pages/ToC/PrivatePolicy";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Reduce server load lol
      refetchInterval: false,
      refetchOnReconnect: false,
    },
  },
});

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
        path: "/my_characters",
        element: <MyCharacters />,
      },
      {
        path: "/characters/:characterId",
        element: <ViewCharacter />,
      },

      // Chat related
      {
        path: "/my_chats",
        element: <MyChats />,
      },
      {
        path: "/chats/:chatId",
        element: <ChatView />,
      },

      // Toc
      {
        path: "/term",
        element: <TermOfUse />,
      },
      {
        path: "/policy",
        element: <PrivatePolicy />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
