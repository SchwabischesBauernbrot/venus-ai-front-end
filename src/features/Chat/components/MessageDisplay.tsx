import { Image, Button, Input, InputRef, List, Popconfirm, Tooltip } from "antd";
import styled from "styled-components";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  RedoOutlined,
} from "@ant-design/icons";
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

  onRegenerate?: (messageId: number) => void;
  canEdit: boolean;

  showRegenerate: boolean;
}

// Some logic to replace {{bot}} and {{user}} on client side
const format = (inputMessage: string, user = "", characterName = "") => {
  return inputMessage
    .replace(/{{char}}:/gi, "")

    .replace(/{{user}}/gi, user)
    .replace(/<user>/gi, user)
    .replace(/{{bot}}/gi, characterName)
    .replace(/{{char}}/gi, characterName)
    .replace(/<bot>/gi, characterName)
    .replace(/<START>/gi, "");
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
  showRegenerate,
  onRegenerate,
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
              <>
                {showRegenerate && (
                  <Tooltip title="Re-generate last massage">
                    <Button
                      type="text"
                      size="large"
                      shape="circle"
                      onClick={() => onRegenerate?.(message.id)}
                    >
                      <RedoOutlined />
                    </Button>
                  </Tooltip>
                )}

                {!message.is_bot && (
                  <Popconfirm
                    title="Delete chat"
                    description="This will delete all messages after this too?"
                    onConfirm={() => onDelete?.(message.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" size="large" shape="circle">
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                )}
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
              </>
            )}
          </ChatControl>
        )
      }
    >
      <List.Item.Meta
        avatar={
          <Image
            width={55}
            style={{ borderRadius: "0.5rem" }}
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
              className="mt-0 px-0 py-0"
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
