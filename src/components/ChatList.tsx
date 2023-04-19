import { ChatEntityWithCharacter } from "../types/backend-alias";
import styled from "styled-components";
import { WechatOutlined, DeleteOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Card, Popconfirm } from "antd";
import { Link } from "react-router-dom";
import { getBotAvatarUrl, getTimeAgo } from "../services/utils";
import { PrivateIndicator } from "./PrivateIndicator";
import { chatService } from "../services/chat/chat-service";

interface ChatListProps {
  chats: ChatEntityWithCharacter[];
  size?: "small" | "medium";
  onChatDeleted: () => {};
}

const BotAvatar = styled.img`
  max-width: 5rem;
  aspect-ratio: 1/1.5;
  object-fit: cover;
  object-position: top;
  border-radius: 1rem;
`;

const ChatContainer = styled.div<{ size: "small" | "medium" }>`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    ${(props) => (props.size === "small" ? "20rem" : "25rem")}
  );
  grid-gap: ${(props) => (props.size === "small" ? "1rem" : "2rem")};
  align-items: stretch;
`;

export const ChatList: React.FC<ChatListProps> = ({ chats, onChatDeleted, size = "medium" }) => {
  const deleteChat = async (chatId: number) => {
    await chatService.deleteChat(chatId);
    onChatDeleted();
  };

  return (
    <ChatContainer size={size}>
      {chats.map((chat) => (
        <Card
          key={chat.id}
          size="small"
          actions={[
            <span>
              <Link to={`/chats/${chat.id}`}>
                <WechatOutlined />
                {"  "}Continue
              </Link>
            </span>,
            <Popconfirm
              title="Delete this chat"
              description="Are you sure to delete this chat?"
              onConfirm={() => deleteChat(chat.id)}
              okText="Yes"
              cancelText="No"
            >
              <DeleteOutlined /> Delete
            </Popconfirm>,
          ]}
        >
          <Card.Meta
            avatar={<BotAvatar alt="" src={getBotAvatarUrl(chat.characters.avatar || "")} />}
            title={
              <span>
                <PrivateIndicator isPublic={chat.is_public} /> {chat.characters.name}
              </span>
            }
            description={
              <div>
                <p>{chat.characters.description}</p>
                <p>
                  <ClockCircleOutlined /> {getTimeAgo(chat.created_at)} ago
                </p>
              </div>
            }
          />
        </Card>
      ))}
    </ChatContainer>
  );
};
