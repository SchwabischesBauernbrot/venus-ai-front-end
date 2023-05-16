import { useCallback, useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConfigProvider, App as AntdApp, theme, Spin, message } from "antd";
import loadable from "@loadable/component";
import { isEqual } from "lodash-es";
import { Session } from "@supabase/supabase-js";

import { AppContext } from "./appContext";
import { axiosInstance, supabase } from "./config";

import { useQuery } from "react-query";
import { Profile } from "./types/profile";
import { getLocalData, UserLocalData, saveLocalData } from "./shared/services/user-local-data";
import { getUserConfig, updateUserConfig, UserConfig } from "./shared/services/user-config";
import { MainLayout } from "./shared/MainLayout";

const Home = loadable(() => import("./features/Home/pages/Home"), {
  resolveComponent: (component) => component.Home,
  fallback: <Spin />,
});

const CreateCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.CreateCharacter,
  fallback: <Spin />,
});
const EditCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.EditCharacter,
  fallback: <Spin />,
});
const MyCharacters = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.MyCharacters,
  fallback: <Spin />,
});
const ViewCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.ViewCharacter,
  fallback: <Spin />,
});
const SearchCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.SearchCharacter,
  fallback: <Spin />,
});

const Register = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Register,
  fallback: <Spin />,
});
const Login = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Login,
  fallback: <Spin />,
});
const PublicProfile = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.PublicProfile,
  fallback: <Spin />,
});
const ProfilePage = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Profile,
  fallback: <Spin />,
});
const ResetPassword = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.ResetPassword,
  fallback: <Spin />,
});

const MyChats = loadable(() => import("./features/Chat"), {
  resolveComponent: (component) => component.MyChats,
  fallback: <Spin />,
});
const ChatPage = loadable(() => import("./features/Chat"), {
  resolveComponent: (component) => component.ChatPage,
  fallback: <Spin />,
});

const TermOfUse = loadable(() => import("./features/ToC"), {
  resolveComponent: (component) => component.TermOfUse,
  fallback: <Spin />,
});
const PrivatePolicy = loadable(() => import("./features/ToC"), {
  resolveComponent: (component) => component.PrivatePolicy,
  fallback: <Spin />,
});
const FAQ = loadable(() => import("./features/ToC"), {
  resolveComponent: (component) => component.FAQ,
  fallback: <Spin />,
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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
        path: "/reset_password",
        element: <ResetPassword />,
      },

      // Profile and Public Profile
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/profiles/:profileId",
        element: <PublicProfile />,
      },

      // Characters
      {
        path: "/search",
        element: <SearchCharacter />,
      },
      {
        path: "/tags/:tagId",
        element: <SearchCharacter />,
      },
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

      // Toc
      {
        path: "/term",
        element: <TermOfUse />,
      },
      {
        path: "/policy",
        element: <PrivatePolicy />,
      },
      {
        path: "/faq",
        element: <FAQ />,
      },
    ],
  },
  {
    path: "/chats/:chatId",
    element: <ChatPage />,
  },
]);

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [config, setConfig] = useState<UserConfig | undefined>();
  const [localData, setLocalData] = useState<UserLocalData>(getLocalData());

  const updateLocalData = useCallback(
    (newData: Partial<UserLocalData>) => {
      setLocalData((oldData) => {
        const mergedData = { ...oldData, ...newData };
        saveLocalData(mergedData);

        return mergedData;
      });
    },
    [setLocalData]
  );

  const updateConfig = useCallback(
    (newConfig: Partial<UserConfig>) => {
      setConfig((oldConfig) => {
        if (!oldConfig) {
          return getUserConfig(newConfig);
        }

        if (!isEqual(oldConfig, newConfig)) {
          return updateUserConfig(newConfig);
        }

        return getUserConfig(newConfig);
      });
    },
    [setConfig]
  );

  useEffect(() => {
    async function run() {
      const response = await supabase.auth.getSession();

      if (response.data.session) {
        setSession(response.data.session);
      }
    }

    run();
  }, []);

  useEffect(() => {
    if (session) {
      axiosInstance.defaults.headers.common = { Authorization: `Bearer ${session.access_token}` };
    }
  }, [session]);

  // Maybe just replace this with usePromise lol
  const { data } = useQuery(
    "profile",
    async () => {
      return await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session?.user.id)
        .limit(1)
        .single();
    },
    {
      enabled: !!session,
      onSuccess: (result) => {
        const profileData = result.data;

        if (session && profileData == null) {
          message.error("Profile not found! Please try login again!");
          return;
        }

        if (profileData) {
          setProfile(profileData);
          Sentry.setUser(profileData);
          updateConfig(getUserConfig(profileData.config));
        }
      },
    }
  );

  return (
    <AppContext.Provider
      value={{
        session,
        setSession,
        profile,
        setProfile,
        config,
        updateConfig,
        localData,
        updateLocalData,
      }}
    >
      <ConfigProvider
        theme={{
          algorithm: [
            theme.darkAlgorithm,
            // localData.theme === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
            // theme.compactAlgorithm,
          ],
          token: {
            fontSize: 16,
          },
        }}
      >
        <AntdApp className="global-css-override">
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </AppContext.Provider>
  );
};

export default App;
