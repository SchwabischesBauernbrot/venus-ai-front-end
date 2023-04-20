import { Avatar, Button, Input, InputRef, List, Popconfirm } from "antd";
import styled from "styled-components";
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { MultiLineMarkdown } from "../../../shared/components/MultiLineMarkdown";
import { getAvatarUrl, getBotAvatarUrl } from "../../../shared/services/utils";
import { SupaChatMessage } from "../../../types/backend-alias";
import { useRef, useState } from "react";

interface MessageDisplayProps {
  message: SupaChatMessage;
  user?: string;
  characterName?: string;

  characterAvatar?: string;
  userAvatar?: string;
  onEdit?: (messageId: number, newMessage: string) => void;
  onDelete?: (messageId: number) => void;
  canEdit: boolean;
}

// Some logic to replace {{bot}} and {{user}} on client side
const format = (inputMessage: string, user = "", characterName = "") => {
  return inputMessage
    .replace(/{{char}}:/gi, "")

    .replace(/{{user}}/gi, user)
    .replace(/<user>/gi, user)
    .replace(/{{bot}}/gi, characterName)
    .replace(/{{char}}/gi, characterName)
    .replace(/<bot>/gi, characterName);
};

export const ChatControl = styled.div`
  opacity: 0.75;
  position: absolute;
  right: 0;
  top: 0.1rem;
`;

export const MessageDisplay: React.FC<MessageDisplayProps> = ({
  message,
  user,
  characterName,
  characterAvatar,
  userAvatar,
  onEdit,
  onDelete,
  canEdit,
}) => {
  const inputRef = useRef<InputRef>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(message.message);

  return (
    <List.Item
      style={{ position: "relative" }}
      key={message.id}
      extra={
        canEdit && (
          <ChatControl>
            {!message.is_bot && (
              <Button type="text" size="large" shape="circle">
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

            {isEditing ? (
              <>
                <Button
                  type="text"
                  shape="circle"
                  size="large"
                  onClick={() => {
                    setIsEditing(false);
                    onEdit?.(message.id, editMessage);
                  }}
                >
                  <CheckOutlined style={{ color: "#2ecc71" }} />
                </Button>
                <Button
                  type="text"
                  shape="circle"
                  size="large"
                  onClick={() => {
                    setIsEditing(false);
                    setEditMessage(message.message);
                  }}
                >
                  <CloseOutlined style={{ color: "#e74c3c", fontSize: "1.1rem" }} />
                </Button>
              </>
            ) : (
              <Button
                type="text"
                size="large"
                shape="circle"
                onClick={() => {
                  setIsEditing(true);

                  setTimeout(() => {
                    inputRef?.current?.focus({
                      cursor: "start",
                    });
                  }, 100);
                }}
              >
                <EditOutlined />
              </Button>
            )}
          </ChatControl>
        )
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
              ref={inputRef}
              autoSize
              bordered={false}
              className="mt-3"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
            />
          ) : (
            <MultiLineMarkdown>{format(message.message, user, characterName)}</MultiLineMarkdown>
          )
        }
      />
    </List.Item>
  );
};
