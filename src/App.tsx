import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";

import { Session } from "@supabase/supabase-js";

import { AppContext } from "./appContext";
import { axiosInstance, supabase } from "./config";

import { Layout, Dropdown, Avatar, Menu } from "antd";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

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

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);

    navigate("/");
  }, []);

  return (
    <AppContext.Provider
      value={{
        session,
        setSession,
      }}
    >
      <Layout className="layout">
        <Header>
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="home">
              <Link to="/">
                <Avatar shape="square" size="large" src="/public/logo.png" alt="logo" />
              </Link>
            </Menu.Item>

            {session ? (
              <>
                <Menu.Item key="create">
                  <Link to="/create_bot">Create bot</Link>
                </Menu.Item>
                <Menu.Item key="profile" style={{ marginLeft: "auto" }}>
                  <Dropdown
                    menu={{
                      items: [
                        { key: "profile", label: "Profile", onClick: () => navigate("/profile") },
                        { key: "logout", label: "Logout", onClick: () => logout() },
                      ],
                    }}
                  >
                    <Avatar size="large" icon={<UserOutlined />} />
                  </Dropdown>
                </Menu.Item>
              </>
            ) : (
              <>
                <Menu.Item key="login">
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
        <p>This is the unofficial version of ....</p>
      </Footer>
    </AppContext.Provider>
  );
};

export default App;
