import { SendOutlined } from "@ant-design/icons";
import { Row, Col, Input, Button, InputRef } from "antd";
import { memo, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useMobileDetect } from "../../../hooks/useMobileDetect";

// Separate this into its own component to prevent re-render on whole ChatPage, lol

export const ChatInputContainer = styled.div`
  padding: 0 1rem;
  margin: auto 0;
  width: 100%;

  textarea {
    font-size: 1rem; // Safari fix lol
  }
`;

export interface ChatInputProps {
  shouldFocus: boolean;
  readyToChat: boolean;
  isGenerating: boolean;
  onGenerateChat(inputMessage: string): void;
}

const ChatInputInternal: React.FC<ChatInputProps> = ({
  shouldFocus,
  readyToChat,
  isGenerating,
  onGenerateChat,
}) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const { isMobile } = useMobileDetect();
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (shouldFocus) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [shouldFocus]);

  const generateChat = () => {
    onGenerateChat(inputMessage);
    setInputMessage("");
  };

  const canGenerateChat = !isGenerating && readyToChat && inputMessage.length > 0;

  const placeholder = isMobile
    ? "Press button to send chat. Enter for linebreak"
    : "Enter to send chat. Shift + Enter for linebreak.";

  return (
    <ChatInputContainer>
      <Row justify="center">
        <Col lg={14} md={18} xs={24}>
          <form onSubmit={generateChat}>
            <div className="d-flex align-center">
              <Input.TextArea
                rows={3}
                disabled={!readyToChat}
                placeholder={
                  readyToChat
                    ? placeholder
                    : "Please setup the API on top right corner to start chating."
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onPressEnter={(event) => {
                  if (isMobile) {
                    return;
                  }

                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault(); // prevent the default line break behavior
                    generateChat();
                  }
                }}
                ref={inputRef}
              />
              <Button
                loading={isGenerating}
                disabled={!canGenerateChat}
                icon={<SendOutlined />}
                type="text"
                size="large"
                style={{
                  color: isGenerating || canGenerateChat ? "#3498db" : "#ffffff40",
                  fontSize: "1.5rem",
                  height: "4rem",
                  paddingLeft: "0.5rem",
                }}
                onClick={generateChat}
              />
            </div>
          </form>
        </Col>
      </Row>
    </ChatInputContainer>
  );
};

export const ChatInput = memo(ChatInputInternal);
