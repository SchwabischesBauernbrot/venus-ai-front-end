import {
  CloseCircleOutlined,
  HomeFilled,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Menu } from "antd";
import { useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../appContext";
import { supabase } from "../../config";
import { useMobileDetect } from "../../hooks/useMobileDetect";
import { getAvatarUrl } from "../services/utils";

export const UserAvatar: React.FC = () => {
  const { profile, setSession, setProfile } = useContext(AppContext);
  const { isMobile } = useMobileDetect();
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);

    navigate("/");
  }, []);

  return (
    <Menu.Item className="no-padding" key="profile" style={{ marginLeft: isMobile ? "auto" : "" }}>
      <Dropdown
        menu={{
          items: [
            {
              key: "my_profile",
              icon: <HomeFilled />,
              label: "Profile",
              onClick: () => navigate("/profile"),
            },
            ...(isMobile
              ? [
                  {
                    key: "add_character",
                    icon: <UserAddOutlined />,
                    label: "Create Character",
                    onClick: () => navigate("/create_character"),
                  },
                ]
              : []),
            {
              key: "my_char",
              icon: <TeamOutlined />,
              label: "My Characters",
              onClick: () => navigate("/my_characters"),
            },
            {
              key: "my_chat",
              icon: <WechatOutlined />,
              label: "My Chats",
              onClick: () => navigate("/my_chats"),
            },
            {
              key: "my_block",
              icon: <CloseCircleOutlined />,
              label: "Blocks",
              onClick: () => navigate("/blocks"),
            },
            { key: "logout", label: "Logout", onClick: () => logout() },
          ],
        }}
      >
        {profile?.avatar ? (
          <Avatar size="large" src={getAvatarUrl(profile.avatar)} />
        ) : (
          <Avatar size="large" icon={<UserOutlined />} />
        )}
      </Dropdown>
    </Menu.Item>
  );
};
