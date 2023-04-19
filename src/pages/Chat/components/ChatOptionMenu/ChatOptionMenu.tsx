import {
  SlidersOutlined,
  BookOutlined,
  WechatOutlined,
  LinkOutlined,
  MenuOutlined,
  SaveOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Tag, Dropdown, Tooltip, Switch, Button, message, App, Input } from "antd";
import { AxiosError } from "axios";

import { useContext, useState } from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../../appContext";
import { chatService } from "../../services/chat-service";
import { ChatEntityWithCharacter } from "../../../../types/backend-alias";
import { ChatHistoryModal } from "./ChatHistoryModal";
import { ChatSettingsModal } from "./ChatSettingsModal";

interface ChatOptionMenuProps {
  chat: ChatEntityWithCharacter;
}

export const ChatOptionMenu: React.FC<ChatOptionMenuProps> = ({ chat }) => {
  const { profile } = useContext(AppContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { modal } = App.useApp();

  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isSharingChat, setIsSharingChat] = useState(false);
  const [openChatHistoryModal, setOpenChatHistoryModal] = useState(false);
  const [openChatSettingsModal, setOpenChatSettingsModal] = useState(true); // For testing

  const createChat = async () => {
    try {
      setIsCreatingChat(true);
      const newChat = await chatService.createChat(chat.character_id!);

      if (newChat) {
        // Lol this will not refresh, just hard refresh instead
        // navigate(`/chats/${newChat.id}`);

        location.href = `/chats/${newChat.id}`;
      }
    } catch (err) {
      message.error(JSON.stringify(err, null, 2));
    } finally {
      setIsCreatingChat(false);
    }
  };

  const shareChat = async () => {
    try {
      setIsSharingChat(true);

      let shouldShowSuccessModal = true;
      if (!chat.is_public) {
        const updatedChat = await chatService.updateChat(chat.id, { is_public: true });
        shouldShowSuccessModal = !!updatedChat;
      }

      if (shouldShowSuccessModal) {
        // Refresh in ChatPage
        const currentUrl = location.href;

        queryClient.invalidateQueries(["chat", chat.id]);
        modal.success({
          title: "Chat ready for sharing!",
          content: (
            <span>
              Your can share your chat using this link:
              <Input value={currentUrl} />
            </span>
          ),
        });
      }
    } catch (err) {
      console.error("error", err);
      const backEndError = (err as AxiosError).response?.data;
      message.error(JSON.stringify(backEndError, null, 2));
    } finally {
      setIsSharingChat(false);
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
        <Tag
          style={{ cursor: "pointer" }}
          color="red"
          onClick={() => setOpenChatSettingsModal(true)}
        >
          API not ready! Click to setup.
        </Tag>
      </span>

      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        menu={{
          selectable: false,
          items: [
            {
              key: "generation",

              label: (
                <Tooltip title="Setup this one time so you can start chatting" placement="right">
                  <div
                    onClick={() => {
                      setOpenChatSettingsModal(true);
                    }}
                  >
                    <SlidersOutlined /> API & Generation Settings
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "my_bot",
              label: (
                <Tooltip
                  title="Generate/Edit Chat Summary (Only support OpenAI for now)"
                  placement="right"
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <SaveOutlined /> Chat Summary
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "all_chat",
              label: (
                <Tooltip title="All your chats with this characters" placement="right">
                  <div
                    onClick={() => {
                      setOpenChatHistoryModal(true);
                    }}
                  >
                    <BookOutlined /> All Chats
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "new_chat",
              label: (
                <Tooltip title="Create a new chat with the same character" placement="right">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCreatingChat) {
                        return;
                      }
                      createChat();
                    }}
                  >
                    {isCreatingChat ? <LoadingOutlined /> : <WechatOutlined />} New Chat
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "share",
              label: (
                <Tooltip title="Make this chat public and give you a link" placement="right">
                  <div
                    onClick={() => {
                      if (isSharingChat) {
                        return;
                      }
                      shareChat();
                    }}
                  >
                    {isSharingChat ? <LoadingOutlined /> : <LinkOutlined />} Share Chat
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "immer",
              label: (
                <Tooltip
                  title="Disable message edit/delete to make it more immersive"
                  placement="right"
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    Immersive Mode <Switch className="ml-2" defaultChecked={false} />
                  </div>
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

      <ChatHistoryModal
        open={openChatHistoryModal}
        character={chat.characters}
        onModalClose={() => setOpenChatHistoryModal(false)}
      />

      <ChatSettingsModal
        open={openChatSettingsModal}
        onModalClose={() => setOpenChatSettingsModal(false)}
      />
    </>
  );
};
