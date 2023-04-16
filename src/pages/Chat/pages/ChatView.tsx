import { Avatar, Button, Col, Row, Spin, Typography } from "antd";

import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Markdown } from "../../../components/Markdown";
import { PageContainer } from "../../../components/shared";
import { axiosInstance, supabase } from "../../../config";
import { getBotAvatarUrl } from "../../../services/utils";
import { ChatResponse } from "../../../types/backend-alias";

const { Title } = Typography;

export const ChatView: React.FC = () => {
  const { chatId } = useParams();

  // Replace this with axios call instead, for better control
  const { data, isLoading } = useQuery(["chat", chatId], async () => {
    const chatResponse = await axiosInstance.get<ChatResponse>(`/chats/${chatId}`);

    return chatResponse.data;
  });

  return (
    <PageContainer>
      {isLoading && <Spin />}

      {data && (
        <>
          <Row>
            <Col span={8} offset={8}>
              <Title level={5}>Chat with {data.chat.characters.name}</Title>

              <span>Settings</span>
              <Button>Share Chat</Button>
            </Col>
          </Row>
          <Row>
            <Col span={8} offset={8}>
              {data.chatMessages.map((message) => (
                <div key={message.id} className="text-left">
                  <p>
                    <Avatar src={getBotAvatarUrl(data.chat.characters.avatar)} />
                    <strong>{message.is_bot ? data.chat.characters.name : "User"}</strong>
                  </p>
                  <div>
                    <Markdown>{message.message}</Markdown>
                  </div>
                </div>
              ))}
              {/* <code>{JSON.stringify(data.chatMessages, null, 2)}</code> */}
            </Col>
          </Row>
        </>
      )}
    </PageContainer>
  );
};
