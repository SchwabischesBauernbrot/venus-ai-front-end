import { SendOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Row, Spin, Typography, Input, Layout } from "antd";

import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { Markdown } from "../../../components/Markdown";
import { PageContainer } from "../../../components/shared";
import { axiosInstance, supabase } from "../../../config";
import { getBotAvatarUrl } from "../../../services/utils";
import { ChatResponse } from "../../../types/backend-alias";

const { Title } = Typography;

export const ChatPage: React.FC = () => {
  const { chatId } = useParams();

  // Replace this with axios call instead, for better control
  const { data, isLoading } = useQuery(["chat", chatId], async () => {
    const chatResponse = await axiosInstance.get<ChatResponse>(`/chats/${chatId}`);

    return chatResponse.data;
  });

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
                  {data.chatMessages.map((message) => (
                    <div key={message.id} className="text-left">
                      <p>
                        <Avatar size={60} src={getBotAvatarUrl(data.chat.characters.avatar)} />
                        <strong>{message.is_bot ? data.chat.characters.name : "User"}</strong>
                      </p>
                      <div>
                        <Markdown>{message.message}</Markdown>
                      </div>
                    </div>
                  ))}
                  {/* <code>{JSON.stringify(data.chatMessages, null, 2)}</code> */}
                </Col>

                <div></div>
              </Row>
              <Row>
                <Col span={12} offset={6}>
                  <Input suffix={<Button icon={<SendOutlined />} type="primary" />} />
                </Col>
              </Row>
            </>
          )}
        </PageContainer>
      </Layout.Content>
    </Layout>
  );
};
