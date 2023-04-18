import { Avatar, Button, Input, List, Popconfirm } from "antd";
import styled from "styled-components";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { MultilineMarkdown } from "../../../components/MultiLineMarkdown";
import { getAvatarUrl, getBotAvatarUrl } from "../../../services/utils";
import { SupaChatMessage } from "../../../types/backend-alias";
import { useState } from "react";

interface MessageDisplayProps {
  message: SupaChatMessage;
  user?: string;
  characterName?: string;

  characterAvatar?: string;
  userAvatar?: string;
  onEdit?: (messageId: number, newMessage: string) => void;
  onDelete?: (messageId: number) => void;
}

// Some logic to replace {{bot}} and {{user}} on client side
const format = (inputMessage: string, user = "", characterName = "") => {
  return inputMessage
    .replace(/{{user}}/gi, user)
    .replace(/<user>/gi, user)
    .replace(/{{bot}}/gi, characterName)
    .replace(/<bot>/gi, characterName);
};

export const ChatControl = styled.div`
  position: absolute;
  right: -1rem;
  top: 0.5rem;
`;

export const MessageDisplay: React.FC<MessageDisplayProps> = ({
  message,
  user,
  characterName,
  characterAvatar,
  userAvatar,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(message.message);

  return (
    <List.Item
      style={{ position: "relative" }}
      key={message.id}
      extra={
        <ChatControl>
          {isEditing ? (
            <>
              <Button
                type="text"
                shape="circle"
                onClick={() => {
                  setIsEditing(false);
                  onEdit?.(message.id, editMessage);
                }}
              >
                <CheckCircleOutlined />
              </Button>
              <Button
                type="text"
                shape="circle"
                onClick={() => {
                  setIsEditing(false);
                  setEditMessage(message.message);
                }}
              >
                <CloseCircleOutlined />
              </Button>
            </>
          ) : (
            <Button type="text" shape="circle" onClick={() => setIsEditing(true)}>
              <EditOutlined />
            </Button>
          )}

          {!message.is_bot && (
            <Button type="text" shape="circle">
              <Popconfirm
                title="Delete chat"
                description="This will delete all messages after this too?"
                onConfirm={() => onDelete?.(message.id)}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined />
              </Popconfirm>
            </Button>
          )}
        </ChatControl>
      }
    >
      <List.Item.Meta
        avatar={
          <Avatar
            size={50}
            src={message.is_bot ? getBotAvatarUrl(characterAvatar) : getAvatarUrl(userAvatar)}
          />
        }
        title={message.is_bot ? characterName : user || "You"}
        description={
          isEditing ? (
            <Input.TextArea
              autoSize
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
            />
          ) : (
            <MultilineMarkdown>{format(message.message, user, characterName)}</MultilineMarkdown>
          )
        }
      />
    </List.Item>
  );
};
