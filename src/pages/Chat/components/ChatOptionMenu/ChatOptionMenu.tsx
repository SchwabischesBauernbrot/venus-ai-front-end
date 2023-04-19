import {
  SettingOutlined,
  SlidersOutlined,
  BookOutlined,
  WechatOutlined,
  LinkOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Tag, Dropdown, Tooltip, Switch, Button, message } from "antd";

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../../appContext";
import { chatService } from "../../../../services/chat/chat-service";
import { ChatEntityWithCharacter } from "../../../../types/backend-alias";

interface ChatOptionMenuProps {
  chat: ChatEntityWithCharacter;
}

export const ChatOptionMenu: React.FC<ChatOptionMenuProps> = ({ chat }) => {
  const { localData, updateLocalData, updateConfig, config, profile } = useContext(AppContext);
  const navigate = useNavigate();

  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const createChat = async () => {
    try {
      setIsCreatingChat(true);
      const newChat = await chatService.createChat(chat.character_id!);

      if (newChat) {
        navigate(`/chats/${newChat.id}`);
      }
    } catch (err) {
      message.error(JSON.stringify(err, null, 2));
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Do not display when user not logged in
  if (!profile) {
    return null;
  }

  return (
    <>
      <span style={{ marginLeft: "auto" }}>
        {/* <Tag color="green">green</Tag> */}
        <Tag color="red">API not ready!</Tag>
      </span>

      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        menu={{
          selectable: false,
          items: [
            {
              key: "my_profile",
              label: "API Settings",
              icon: <SettingOutlined />,
            },
            {
              key: "generation",
              label: "Generation Settings",
              icon: <SlidersOutlined />,
            },
            // {
            //   key: "my_bot",
            //   label: "Chat Summary",
            //   icon: <SaveOutlined />,
            // },
            {
              key: "all_chat",
              label: (
                <Tooltip title="All your chats with this characters">
                  <Button
                    type="text"
                    loading={isCreatingChat}
                    onClick={(e) => {
                      e.stopPropagation();
                      createChat();
                    }}
                  >
                    <BookOutlined /> All Chats
                  </Button>
                </Tooltip>
              ),
            },
            {
              key: "new_chat",
              label: (
                <Tooltip title="Create a new chat with the same character">
                  <Button
                    type="text"
                    loading={isCreatingChat}
                    onClick={(e) => {
                      e.stopPropagation();
                      createChat();
                    }}
                  >
                    <WechatOutlined /> New Chat
                  </Button>
                </Tooltip>
              ),
            },
            {
              key: "share",
              label: "Share Chat",
              icon: <LinkOutlined />,
            },
            {
              key: "immer",
              label: (
                <Tooltip title="Disable message edit/delete to make it more immersive">
                  <span onClick={(e) => e.stopPropagation()}>
                    Immersive Mode <Switch className="ml-2" defaultChecked={false} />
                  </span>
                </Tooltip>
              ),
            },
          ],
        }}
      >
        <Button type="text" size="large">
          <MenuOutlined />
        </Button>
      </Dropdown>
    </>
  );
};
