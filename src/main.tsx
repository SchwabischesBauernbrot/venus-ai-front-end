import { Session } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { AppContext } from "./appContext";
import { supabase } from "./config";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile/Profile";
import { Register } from "./pages/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
]);
const queryClient = new QueryClient();

const MainApp = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function run() {
      const response = await supabase.auth.getSession();

      if (response.data.session) {
        setSession(response.data.session);
      }
    }

    run();
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);

    location.href = "/";
  }, []);

  return (
    <AppContext.Provider
      value={{
        session,
        setSession,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <header>
          <nav>
            {session ? (
              <ul>
                <li>
                  <a href="/">Explore</a>
                </li>
                <li>
                  <a href="/profile">Profile</a>
                </li>
                <li>
                  <a href="#" onClick={logout}>
                    Logout
                  </a>
                </li>
              </ul>
            ) : (
              <span>
                <a href="/login">Login</a> or <a href="/register">Sign up</a>
              </span>
            )}
          </nav>
        </header>

        <main>
          <RouterProvider router={router} />
        </main>

        <footer>
          <p>This is the unofficial version of ....</p>
        </footer>
      </QueryClientProvider>
    </AppContext.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);
