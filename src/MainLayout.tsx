import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { Layout, Avatar, Menu, Tooltip } from "antd";
import { BulbOutlined, UserAddOutlined } from "@ant-design/icons";

import { AppContext } from "./appContext";

import { UserAvatar } from "./components/UserAvatar";

const { Header, Content, Footer } = Layout;

export const MainLayout: React.FC = () => {
  const { session, profile, updateLocalData, localData } = useContext(AppContext);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Menu selectable={false} theme="dark" mode="horizontal">
          <Menu.Item key="home">
            <Link to="/">
              <Avatar shape="square" size="large" src="/logo.png" alt="logo" />
            </Link>
          </Menu.Item>

          {session && profile ? (
            <>
              <Menu.Item key="create">
                <Link to="/create_character">
                  <UserAddOutlined /> Create Character
                </Link>
              </Menu.Item>

              <Menu.Item
                key="theme"
                style={{ marginLeft: "auto" }}
                onClick={() => {
                  updateLocalData({ theme: localData.theme === "dark" ? "light" : "dark" });
                }}
              >
                <Tooltip title="Toggle Dark mode">
                  <BulbOutlined />
                </Tooltip>
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

      <Content style={{ padding: "0 50px" }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: "center" }}>
        <p>This is the unofficial website of Pygmalion AI. Uncensored, No Ad, Forever Free.</p>

        <p>
          <a target="_blank" href="https://www.reddit.com/r/PygmalionAI">
            <img src="https://img.icons8.com/bubbles/50/null/reddit.png" />
          </a>
          <a target="_blank" href="https://discord.gg/ZHXEa3yywq">
            <img src="https://img.icons8.com/bubbles/50/null/discord-logo.png" />
          </a>
          <a target="_blank" href="https://github.com/pyg-ai-unonfficial">
            <img src="https://img.icons8.com/bubbles/50/null/github.png" />
          </a>
        </p>

        <span>
          <a href="https://github.com/pyg-ai-unonfficial/front-end/issues" target="_blank">
            🐛 Bug Report
          </a>
          <span> - </span>
          <a
            href="https://github.com/orgs/pyg-ai-unonfficial/discussions/categories/ideas"
            target="_blank"
          >
            💡Feedback & Idea
          </a>
          <span> - </span>
          <a href="/policy" target="_blank">
            📜 Content & Private Policy
          </a>
          <span> - </span>
          <a href="/term" target="_blank">
            🤝 Term of Use
          </a>
        </span>
      </Footer>
    </Layout>
  );
};