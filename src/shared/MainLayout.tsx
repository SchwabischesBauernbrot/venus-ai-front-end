import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { Layout, Menu } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";

import { AppContext } from "../appContext";

import { UserAvatar } from "./components/UserAvatar";

const { Header, Content, Footer } = Layout;

export const MainLayout: React.FC = () => {
  const { session, profile } = useContext(AppContext);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Menu selectable={false} theme="dark" mode="horizontal">
          <Menu.Item className="no-padding" key="home">
            <Link to="/">
              <img
                style={{ width: "100px", position: "relative", top: "-1px" }}
                src="/logo_small.png"
                alt="logo"
              />
            </Link>
          </Menu.Item>
          <Menu.Item key="search">
            <Link to="/search">
              <SearchOutlined /> Search
            </Link>
          </Menu.Item>

          {session && profile ? (
            <>
              <Menu.Item key="create" style={{ marginLeft: "auto" }}>
                <Link to="/create_character">
                  <UserAddOutlined /> Create Character
                </Link>
              </Menu.Item>

              {/* <Menu.Item
                key="theme"
                style={{ marginLeft: "auto" }}
                onClick={() => {
                  updateLocalData({ theme: localData.theme === "dark" ? "light" : "dark" });
                }}
              >
                <Tooltip title="Toggle Dark mode">
                  <BulbOutlined />
                </Tooltip>
              </Menu.Item> */}

              <UserAvatar />
            </>
          ) : (
            <>
              <Menu.Item style={{ marginLeft: "auto" }} key="login">
                <Link to="/login">Login</Link>
              </Menu.Item>
              <Menu.Item className="no-padding" key="register">
                <Link to="/register">Register</Link>
              </Menu.Item>
            </>
          )}
        </Menu>
      </Header>

      <Content className="main-layout-content">
        <Outlet />
      </Content>

      <Footer style={{ textAlign: "center" }}>
        <p>Venus AI - Chat with your waifu/husbando. Uncensored, No Ad, Forever Free.</p>

        <p>
          <a target="_blank" href="https://www.reddit.com/r/VenusAI_Official">
            <img src="https://img.icons8.com/bubbles/50/null/reddit.png" />
          </a>
          <a target="_blank" href="https://discord.gg/wFPemXeEUf">
            <img src="https://img.icons8.com/bubbles/50/null/discord-logo.png" />
          </a>
          <a target="_blank" href="https://github.com/venus-ai-team">
            <img src="https://img.icons8.com/bubbles/50/null/github.png" />
          </a>
        </p>

        <span>
          <a href="https://github.com/pyg-ai-unonfficial/front-end/issues" target="_blank">
            🐛 Bug Report
          </a>
          <span> - </span>
          <a
            href="https://github.com/orgs/venus-ai-team/discussions/categories/ideas"
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
          <span> - </span>
          <a href="/faq" target="_blank">
            🙋 FAQ
          </a>
        </span>
      </Footer>
    </Layout>
  );
};
