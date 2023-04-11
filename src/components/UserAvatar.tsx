import { UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu } from "antd";
import { useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../appContext";
import { supabase } from "../config";
import { getAvatarUrl } from "../services/utils";

export const UserAvatar: React.FC = () => {
  const { profile, setSession, setProfile } = useContext(AppContext);
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);

    navigate("/");
  }, []);

  return (
    <Menu.Item key="profile" style={{ marginLeft: "auto" }}>
      <Dropdown
        menu={{
          items: [
            { key: "my_profile", label: "My Profile", onClick: () => navigate("/profile") },
            { key: "my_bot", label: "My Character", onClick: () => navigate("/my_characters") },
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
