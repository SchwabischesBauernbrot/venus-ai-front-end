import { Avatar, Button, Col, Row, Spin, Typography, Input, Layout, InputRef, List } from "antd";
import { useQuery } from "react-query";
import styled from "styled-components";
import { Link, useParams } from "react-router-dom";
import { EditOutlined, SendOutlined } from "@ant-design/icons";

import { Markdown } from "../../../components/Markdown";
import { PageContainer } from "../../../components/shared";
import { axiosInstance, supabase } from "../../../config";
import { getAvatarUrl, getBotAvatarUrl } from "../../../services/utils";
import { ChatMessageEntity, ChatResponse, SupaChatMessage } from "../../../types/backend-alias";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../appContext";
import { generate } from "../../../services/generate/mock-generate";

const { Title } = Typography;

const ChatInputContainer = styled.div`
  position: fixed;
  bottom: 1rem;
  width: 98%;
`;

const ChatContainer = styled.div`
  height: calc(100vh - 11rem);
  padding-right: 1rem;
  overflow-y: scroll;
`;

const ChatControl = styled.div`
  position: absolute;
  right: -1rem;
  top: 0.5rem;
`;

export const ChatPage: React.FC = () => {
  const { profile } = useContext(AppContext);
  const { chatId } = useParams();
  const inputRef = useRef<InputRef>(null);
  const messageDivRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<SupaChatMessage[]>([]);

  // Replace this with axios call instead, for better control
  const { data, refetch, isLoading } = useQuery(
    ["chat", chatId],
    async () => {
      const chatResponse = await axiosInstance.get<ChatResponse>(`/chats/${chatId}`);

      return chatResponse.data;
    },
    {
      enabled: false,
      onSuccess: () => {
        inputRef.current?.focus();

        // Hack to wait for div to render
        setTimeout(() => {
          if (messageDivRef.current) {
            messageDivRef.current.scrollTop = messageDivRef.current?.scrollHeight;
          }
        }, 500);
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

  const sendChat = async () => {
    try {
      setIsGenerating(true);

      const fakeLocalMessage: ChatMessageEntity = {
        id: -1,
        chat_id: 0,
        created_at: "",
        is_bot: true,
        is_main: false,
        message: message,
      };
      setChatMessages([...chatMessages, fakeLocalMessage]);
      if (messageDivRef.current) {
        messageDivRef.current.scrollTop = messageDivRef.current?.scrollHeight;
      }

      const response = await axiosInstance.post<ChatMessageEntity>(`/chats/${chatId}/messages`, {
        message,
        is_bot: false,
        is_main: true,
      });
      const newChatMessage = response.data;
      // Delete is_main : false message too
      setChatMessages([...chatMessages, newChatMessage]);

      // Call back-end to get generated message
      const fakeBotMessage: ChatMessageEntity = {
        id: -1,
        chat_id: 0,
        created_at: "",
        is_bot: true,
        is_main: false,
        message: "",
      };
      setChatMessages([...chatMessages, newChatMessage, fakeBotMessage]);
      if (messageDivRef.current) {
        messageDivRef.current.scrollTop = messageDivRef.current?.scrollHeight;
      }

      let combined = "";
      const botMassges = await generate(message);
      for await (const message of botMassges) {
        combined = combined += message;
        const newBotMessage: ChatMessageEntity = {
          id: -1,
          chat_id: 0,
          created_at: "",
          is_bot: true,
          is_main: false,
          message: combined,
        };
        setChatMessages([...chatMessages, newChatMessage, newBotMessage]);
        if (messageDivRef.current) {
          messageDivRef.current.scrollTop = messageDivRef.current?.scrollHeight;
        }
      }

      const responseAgain = await axiosInstance.post<ChatMessageEntity>(
        `/chats/${chatId}/messages`,
        {
          message: combined,
          is_bot: true,
          is_main: false,
        }
      );
      setChatMessages([...chatMessages, newChatMessage, responseAgain.data]);
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
                      dataSource={chatMessages}
                      renderItem={(item) => (
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
                            title={item.is_bot ? data.chat.characters.name : profile?.name || "You"}
                            description={<Markdown>{item.message}</Markdown>}
                          />
                        </List.Item>
                      )}
                    />
                  </ChatContainer>
                </Col>

                <div></div>
              </Row>
            </>
          )}

          <ChatInputContainer>
            <Row>
              {/* TODO: Disable this when not set API */}
              <Col span={12} offset={6}>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onPressEnter={sendChat}
                  ref={inputRef}
                  suffix={
                    <Button
                      loading={isGenerating}
                      disabled={isGenerating}
                      icon={<SendOutlined />}
                      type="primary"
                      onClick={sendChat}
                    />
                  }
                />
              </Col>
            </Row>
          </ChatInputContainer>
        </PageContainer>
      </Layout.Content>
    </Layout>
  );
};
