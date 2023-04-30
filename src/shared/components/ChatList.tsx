import { ChatEntityWithCharacter } from "../../types/backend-alias";
import styled, { css } from "styled-components";
import { WechatOutlined, DeleteOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Card, Popconfirm, Tooltip } from "antd";
import { truncate } from "lodash-es";

import { getBotAvatarUrl, getTimeAgo } from "../services/utils";
import { PrivateIndicator } from "./PrivateIndicator";
import { chatService } from "../../features/Chat/services/chat-service";

interface ChatListProps {
  chats: ChatEntityWithCharacter[];
  size?: "small" | "medium";
  onChatDeleted?: () => {};
}

const BotAvatar = styled.img`
  max-width: 5rem;
  aspect-ratio: 1/1.5;
  object-fit: cover;
  object-position: top;
  border-radius: 1rem;
`;

const ChatListContainer = styled.div<{ size: "small" | "medium" }>`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  grid-gap: ${(props) => (props.size === "small" ? "1rem" : "2rem")};
  align-items: stretch;

  ${(props) =>
    props.size === "small" &&
    css`
      .ant-card-body,
      .ant-card-meta-title {
        font-size: 0.8rem;
      }
    `}
`;

export const ChatList: React.FC<ChatListProps> = ({ chats, onChatDeleted, size = "medium" }) => {
  const deleteChat = async (chatId: number) => {
    await chatService.deleteChat(chatId);
    onChatDeleted?.();
  };

  return (
    <ChatListContainer size={size}>
      {chats.map((chat) => (
        <Card
          key={chat.id}
          className="d-flex flex-column"
          size="small"
          actions={[
            <span>
              <a href={`/chats/${chat.id}`} target="_blank">
                <WechatOutlined />
                {"  "}Continue
              </a>
            </span>,

            onChatDeleted ? (
              <Popconfirm
                title="Delete this chat"
                description="Are you sure to delete this chat?"
                onConfirm={() => deleteChat(chat.id)}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined /> Delete
              </Popconfirm>
            ) : undefined,
          ].filter((a) => a)}
        >
          <Card.Meta
            avatar={<BotAvatar alt="" src={getBotAvatarUrl(chat.characters?.avatar || "")} />}
            title={
              <span>
                <PrivateIndicator isPublic={chat.is_public} /> {chat.characters.name}
              </span>
            }
            // Change to summary later
            description={
              <div>
                {chat.summary ? (
                  <Tooltip title={chat.summary}>
                    <p>Summary: {truncate(chat.summary, { length: 150 })}</p>
                  </Tooltip>
                ) : (
                  <p>{truncate(chat.characters.description, { length: 150 })}</p>
                )}
                <p>
                  <ClockCircleOutlined /> {getTimeAgo(chat.updated_at)} ago
                </p>
              </div>
            }
          />
        </Card>
      ))}
    </ChatListContainer>
  );
};
