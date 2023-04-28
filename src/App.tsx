import { useCallback, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConfigProvider, App as AntdApp, theme } from "antd";
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

const Home = loadable(() => import("./features/Home"), {
  resolveComponent: (component) => component.Home,
});

const CreateCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.CreateCharacter,
});
const EditCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.EditCharacter,
});
const MyCharacters = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.MyCharacters,
});
const ViewCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.ViewCharacter,
});

const Register = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Register,
});
const Login = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Login,
});
const PublicProfile = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.PublicProfile,
});
const ProfilePage = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Profile,
});
const Settings = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Settings,
});

const MyChats = loadable(() => import("./features/Chat"), {
  resolveComponent: (component) => component.MyChats,
});
const ChatPage = loadable(() => import("./features/Chat"), {
  resolveComponent: (component) => component.ChatPage,
});

const TermOfUse = loadable(() => import("./features/ToC"), {
  resolveComponent: (component) => component.TermOfUse,
});
const PrivatePolicy = loadable(() => import("./features/ToC"), {
  resolveComponent: (component) => component.PrivatePolicy,
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

      // Profile and Public Profile
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/settings",
        element: <Settings />,
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

        if (profileData) {
          setProfile(profileData);
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
