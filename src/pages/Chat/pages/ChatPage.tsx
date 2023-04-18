import {
  Avatar,
  Button,
  Col,
  Row,
  Spin,
  Typography,
  Input,
  Layout,
  InputRef,
  List,
  Popconfirm,
} from "antd";
import { useQuery } from "react-query";
import styled from "styled-components";
import { Link, useParams } from "react-router-dom";
import { DeleteOutlined, EditOutlined, SendOutlined } from "@ant-design/icons";

import { PageContainer } from "../../../components/shared";
import { getAvatarUrl, getBotAvatarUrl } from "../../../services/utils";
import { ChatMessageEntity, ChatResponse, SupaChatMessage } from "../../../types/backend-alias";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../appContext";
import { generate } from "../../../services/generate/mock-generate";
import { MultilineMarkdown } from "../../../components/MultiLineMarkdown";
import * as _ from "lodash-es";
import { chatService } from "../../../services/chat/chat-service";
const { Title } = Typography;

const ChatInputContainer = styled.div`
  position: fixed;
  bottom: 1rem;
  width: 98%;
`;

const ChatContainer = styled.div`
  height: calc(100vh - 13rem);
  padding-right: 1rem;
  overflow-y: scroll;
`;

const ChatControl = styled.div`
  position: absolute;
  right: -1rem;
  top: 0.5rem;
`;

const BotChoicesContainer = styled.div<{ index: number }>`
  text-align: left;
  display: flex;
  min-height: 5rem;

  transition: 0.5s;
  transform: ${(props) => `translateX(-${props.index * 100}%);`}

  /* overflow-x: hidden; */
  scroll-snap-type: x mandatory;

  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  .ant-list-item {
    flex: 0 0 100%;
    width: 100%;
    width: 100%;
  }

  .ant-list-item .ant-list-item-meta {
    display: flex;
    flex: 1;
    align-items: flex-start;
    max-width: 100%;
  }
`;

const BotMessageControl = styled.div`
  position: absolute;
  top: 0;
  z-index: 1;
`;

export const ChatPage: React.FC = () => {
  const { profile } = useContext(AppContext);
  const { chatId } = useParams();
  const inputRef = useRef<InputRef>(null);
  const messageDivRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  // Refactor this instead of just use set?
  const [chatMessages, setChatMessages] = useState<SupaChatMessage[]>([]);

  const mainMessages = chatMessages.filter((message) => message.is_main);
  const botChoices = chatMessages.filter((message) => message.is_bot && !message.is_main);
  const [choiceIndex, setChoiceIndex] = useState(0);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messageDivRef.current) {
        messageDivRef.current.scrollTop = messageDivRef.current?.scrollHeight;
      }
    }, 200);
  }, [messageDivRef.current]);

  // Replace this with axios call instead, for better control
  const { data, refetch, isLoading } = useQuery(
    ["chat", chatId],
    async () => chatService.getChatById(chatId),
    {
      enabled: false,
      onSuccess: () => {
        inputRef.current?.focus();

        scrollToBottom();
      },
    }
  );

  useEffect(() => {
    refetch().then((data) => {
      const messages = data.data?.chatMessages || [];
      messages.sort((a, b) => a.id - b.id);
      setChatMessages([...messages]);
    });
  }, [profile]);

  // Some logic to replace {{bot}} and {{user}} on client side
  const format = (inputMessage: string) => {
    return inputMessage
      .replace(/{{user}}/gi, profile?.name || "")
      .replace(/<user>/gi, profile?.name || "")
      .replace(/{{bot}}/gi, data?.chat.characters.name || "")
      .replace(/<bot>/gi, data?.chat.characters.name || "");
  };

  const deleteChat = async (messageId: number) => {
    const messageToDeletes = chatMessages.filter((message) => message.id >= messageId);
    await chatService.deleteMessages(
      chatId,
      messageToDeletes.map((message) => message.id)
    );

    refetch().then((data) => {
      const messages = data.data?.chatMessages || [];
      messages.sort((a, b) => a.id - b.id);
      setChatMessages([...messages]);
    });
  };

  const swipe = async (direction: "left" | "right") => {
    // If message already have, just slide
    const newIndex = choiceIndex + (direction === "left" ? -1 : 1);
    if (newIndex < 0) {
      return;
    } else if (newIndex < botChoices.length) {
      setChoiceIndex(newIndex);
      return;
    }

    // Other wise, generate
    setIsGenerating(true);
    try {
      const fakeBotMessage: ChatMessageEntity = {
        id: -1,
        chat_id: 0,
        created_at: "",
        is_bot: true,
        is_main: false,
        message: "",
      };
      setChatMessages([...chatMessages, fakeBotMessage]);
      setChoiceIndex(newIndex);

      let combined = "";
      // try get prompt somehow
      const prompt = _.findLast(chatMessages, (m) => !m.is_bot)?.message || "";
      const botMessages = await generate(prompt);
      for await (const message of botMessages) {
        combined = combined += message;
        const newBotMessage: ChatMessageEntity = {
          id: -1,
          chat_id: 0,
          created_at: "",
          is_bot: true,
          is_main: false,
          message: combined,
        };
        setChatMessages([...chatMessages, newBotMessage]);
        scrollToBottom();
      }

      const finalBotMessage = await chatService.createMessage(chatId, {
        message: combined,
        is_bot: true,
        is_main: false,
      });

      setChatMessages([...chatMessages, finalBotMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendChat = async () => {
    try {
      setIsGenerating(true);

      let chatMessagesCopy = [...chatMessages];

      const fakeLocalMessage: ChatMessageEntity = {
        id: -2,
        chat_id: 0,
        created_at: "",
        is_bot: false,
        is_main: true,
        message: message,
      };
      const fakeBotMessage: ChatMessageEntity = {
        id: -1,
        chat_id: 0,
        created_at: "",
        is_bot: true,
        is_main: false,
        message: "",
      };

      // Remove non is_main message
      const choiceToKeep = botChoices[choiceIndex];
      if (choiceToKeep) {
        choiceToKeep.is_main = true;

        // No await, lol
        chatService.updateMassage(chatId, {
          message_id: choiceToKeep.id,
          message: choiceToKeep.message,
          is_main: true,
        });
      }
      const choicesToDelete = botChoices.filter((v, i) => i !== choiceIndex);
      if (choicesToDelete.length > 0) {
        chatService.deleteMessages(
          chatId,
          choicesToDelete.map((message) => message.id)
        );
      }
      chatMessagesCopy = chatMessagesCopy.filter((message) => message.is_main);
      setChatMessages([...chatMessagesCopy, fakeLocalMessage, fakeBotMessage]);
      setChoiceIndex(0);
      scrollToBottom();

      const newChatMessage = await chatService.createMessage(chatId, fakeLocalMessage);
      setChatMessages([...chatMessagesCopy, newChatMessage, fakeBotMessage]);

      // Call back-end to get generated message
      let combined = "";
      let newBotMessage: ChatMessageEntity = {
        id: -1,
        chat_id: 0,
        created_at: "",
        is_bot: true,
        is_main: false,
        message: combined,
      };

      const chatMessagesWithew = [...chatMessagesCopy, newChatMessage];
      const prompt = _.findLast(chatMessagesWithew, (m) => !m.is_bot)?.message || "";

      const botMessages = await generate(prompt);
      for await (const message of botMessages) {
        combined = combined += message;
        newBotMessage.message = combined;
        setChatMessages([...chatMessagesCopy, newChatMessage, newBotMessage]);
        scrollToBottom();
      }

      const finalBotMessage = await chatService.createMessage(chatId, newBotMessage);

      setChatMessages([...chatMessagesCopy, newChatMessage, finalBotMessage]);
      setMessage("");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Content>
        <PageContainer>
          {isLoading && <Spin />}

          {data && (
            <>
              <Row>
                <Col span={12} offset={6}>
                  <Link to="/">
                    <Button>Back</Button>
                  </Link>
                  <Title level={5}>Chat with {data.chat.characters.name}</Title>

                  <span>Settings</span>
                  <Button>Share Chat</Button>
                </Col>
              </Row>

              <Row>
                <Col span={12} offset={6}>
                  <ChatContainer ref={messageDivRef}>
                    <List
                      className="text-left"
                      itemLayout="horizontal"
                      dataSource={mainMessages}
                      renderItem={(item) => (
                        <List.Item
                          style={{ position: "relative" }}
                          key={item.id}
                          extra={
                            <ChatControl>
                              <Button type="text">
                                <EditOutlined />
                                {!item.is_bot && (
                                  <Popconfirm
                                    title="Delete chat"
                                    description="This will delete all messages after this too?"
                                    onConfirm={() => deleteChat(item.id)}
                                    okText="Yes"
                                    cancelText="No"
                                  >
                                    <DeleteOutlined />
                                  </Popconfirm>
                                )}
                              </Button>
                            </ChatControl>
                          }
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                size={60}
                                src={
                                  item.is_bot
                                    ? getBotAvatarUrl(data.chat.characters.avatar)
                                    : getAvatarUrl(profile?.avatar)
                                }
                              />
                            }
                            title={item.is_bot ? data.chat.characters.name : profile?.name || "You"}
                            description={
                              <MultilineMarkdown>{format(item.message)}</MultilineMarkdown>
                            }
                          />
                        </List.Item>
                      )}
                    />

                    {botChoices.length > 0 && (
                      <div style={{ overflowX: "hidden", position: "relative" }}>
                        <BotMessageControl>
                          {choiceIndex > 0 && <Button onClick={() => swipe("left")}>Left</Button>}
                          <Button onClick={() => swipe("right")}>Right</Button>
                        </BotMessageControl>

                        <BotChoicesContainer index={choiceIndex}>
                          {botChoices.map((item) => (
                            <List.Item
                              style={{ position: "relative" }}
                              key={item.id}
                              extra={
                                <ChatControl>
                                  <Button type="text">
                                    <EditOutlined />
                                  </Button>
                                </ChatControl>
                              }
                            >
                              <List.Item.Meta
                                avatar={
                                  <Avatar
                                    size={60}
                                    src={
                                      item.is_bot
                                        ? getBotAvatarUrl(data.chat.characters.avatar)
                                        : getAvatarUrl(profile?.avatar)
                                    }
                                  />
                                }
                                title={
                                  item.is_bot ? data.chat.characters.name : profile?.name || "You"
                                }
                                description={
                                  <MultilineMarkdown>{format(item.message)}</MultilineMarkdown>
                                }
                              />
                            </List.Item>
                          ))}
                        </BotChoicesContainer>
                      </div>
                    )}
                  </ChatContainer>
                </Col>
              </Row>
            </>
          )}

          <ChatInputContainer>
            <Row>
              {/* TODO: Disable this when not set API */}
              <Col span={12} offset={6}>
                <div className="d-flex align-center">
                  <Input.TextArea
                    value={message}
                    rows={3}
                    onChange={(e) => setMessage(e.target.value)}
                    onPressEnter={sendChat}
                    ref={inputRef}
                  />
                  <Button
                    loading={isGenerating}
                    disabled={isGenerating}
                    icon={<SendOutlined />}
                    type="primary"
                    onClick={sendChat}
                  />
                </div>
              </Col>
            </Row>
          </ChatInputContainer>
        </PageContainer>
      </Layout.Content>
    </Layout>
  );
};
