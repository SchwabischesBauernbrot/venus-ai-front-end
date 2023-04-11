import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";

import { Session } from "@supabase/supabase-js";

import { AppContext } from "./appContext";
import { axiosInstance, supabase } from "./config";

import { Layout, Dropdown, Avatar, Menu } from "antd";
import { useQuery } from "react-query";
import { Profile } from "./types/profile";
import { UserAvatar } from "./components/UserAvatar";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

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
        setProfile(result.data);
      },
    }
  );

  // const logout = useCallback(async () => {
  //   await supabase.auth.signOut();
  //   setSession(null);

  //   navigate("/");
  // }, []);

  return (
    <AppContext.Provider
      value={{
        session,
        setSession,
        profile,
        setProfile,
      }}
    >
      <Layout className="layout">
        <Header>
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="home">
              <Link to="/">
                <Avatar shape="square" size="large" src="/logo.png" alt="logo" />
              </Link>
            </Menu.Item>

            {session && profile ? (
              <>
                <Menu.Item key="create">
                  <Link to="/create_bot">Create bot</Link>
                </Menu.Item>

                <UserAvatar />
              </>
            ) : (
              <>
                <Menu.Item style={{ marginLeft: "auto" }} key="login">
                  <Link to="/login">Login</Link>
                </Menu.Item>
                <Menu.Item key="register">
                  <Link to="/register">Register</Link>
                </Menu.Item>
              </>
            )}
          </Menu>
        </Header>
      </Layout>

      <Content style={{ padding: "0 50px" }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: "center" }}>
        <p>This is the unofficial Website of Pygmalion AI.</p>

        <div>
          <a target="_blank" href="https://www.reddit.com/r/PygmalionAI/">
            <img src="https://img.icons8.com/bubbles/50/null/reddit.png" />
          </a>
          <a target="_blank" href="https://www.reddit.com/r/PygmalionAI/">
            <img src="https://img.icons8.com/bubbles/50/null/discord-logo.png" />
          </a>
          <a target="_blank" href="https://www.reddit.com/r/PygmalionAI/">
            <img src="https://img.icons8.com/bubbles/50/null/github.png" />
          </a>
        </div>
      </Footer>
    </AppContext.Provider>
  );
};

export default App;
