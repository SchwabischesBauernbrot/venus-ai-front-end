import { useCallback, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConfigProvider, App as AntdApp, theme } from "antd";
import loadable from "@loadable/component";
import * as _ from "lodash-es";
import { Session } from "@supabase/supabase-js";

import { AppContext } from "./appContext";
import { axiosInstance, supabase } from "./config";

import { useQuery } from "react-query";
import { Profile } from "./types/profile";
import { getLocalData, UserLocalData, saveLocalData } from "./services/user-local-data";
import { MainLayout } from "./MainLayout";
import { CreateCharacter, EditCharacter, MyCharacters, ViewCharacter } from "./pages/Character";
import { MyChats, ChatPage } from "./pages/Chat";
import { Home } from "./pages/Home";
import { Register, Login, PublicProfile, Profile as ProfilePage } from "./pages/Profile";
import { TermOfUse, PrivatePolicy } from "./pages/ToC";
import { getUserConfig, updateUserConfig, UserConfig } from "./services/user-config";

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
    (newConfig: UserConfig) => {
      console.log("this callback is called");

      setConfig((oldConfig) => {
        if (!oldConfig) {
          return newConfig;
        }

        if (!_.isEqual(oldConfig, newConfig)) {
          // Back-end sync if value changes
          updateUserConfig(newConfig);
        }

        return newConfig;
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
            localData.theme === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
            // theme.compactAlgorithm,
          ],
        }}
      >
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </AppContext.Provider>
  );
};

export default App;
