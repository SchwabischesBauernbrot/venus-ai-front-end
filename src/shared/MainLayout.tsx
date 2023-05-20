import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { Layout, Menu, Spin } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";

import { AppContext } from "../appContext";

import { UserAvatar } from "./components/UserAvatar";
import { EnvIndicator } from "./components/EnvIndicator";
import { useMobileDetect } from "../hooks/useMobileDetect";

const { Header, Content, Footer } = Layout;

export const MainLayout: React.FC = () => {
  const { session, profile, isProfileLoading } = useContext(AppContext);
  const { isMobile } = useMobileDetect();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Menu selectable={false} theme="dark" mode="horizontal">
          <Menu.Item className="no-padding" key="home">
            <Link to="/">
              <EnvIndicator />
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

          {(() => {
            if (!session) {
              return (
                <>
                  <Menu.Item style={{ marginLeft: "auto" }} key="login">
                    <Link to="/login">Login</Link>
                  </Menu.Item>
                  <Menu.Item className="no-padding" key="register">
                    <Link to="/register">Register</Link>
                  </Menu.Item>
                </>
              );
            }

            if (isProfileLoading) {
              return (
                <Menu.Item>
                  <Spin />
                </Menu.Item>
              );
            } else if (profile) {
              return (
                <>
                  {!isMobile && (
                    <Menu.Item key="create" style={{ marginLeft: "auto" }}>
                      <Link to="/create_character">
                        <UserAddOutlined /> Create Character
                      </Link>
                    </Menu.Item>
                  )}

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
              );
            }
          })()}
        </Menu>
      </Header>

      <Content className="main-layout-content">
        <Outlet />
      </Content>

      <Footer style={{ textAlign: "center" }}>
        <p>
          <strong>Venus AI</strong> - Chat with your waifu/husbando. Uncensored, No Ad, Forever
          Free.{" "}
          <a target="_blank" href="https://www.patreon.com/Venus_AI">
            (Support us to keep this site running)
          </a>
        </p>

        <p>
          <a target="_blank" href="https://www.reddit.com/r/VenusAI_Official">
            <img src="https://img.icons8.com/bubbles/50/null/reddit.png" alt="reddit" />
          </a>
          <a target="_blank" href="https://discord.gg/wFPemXeEUf">
            <img src="https://img.icons8.com/bubbles/50/null/discord-logo.png" alt="discord" />
          </a>
          <a target="_blank" href="https://github.com/venus-ai-team">
            <img src="https://img.icons8.com/bubbles/50/null/github.png" alt="github" />
          </a>
          <a target="_blank" href="https://www.patreon.com/Venus_AI">
            <img src="https://img.icons8.com/bubbles/50/patreon.png" alt="patreon" />
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
            🙋 FAQ - Donation
          </a>
        </span>
      </Footer>
    </Layout>
  );
};
