import { Typography, Spin, Card, Avatar, Popconfirm } from "antd";
import styled from "styled-components";
import { PageContainer } from "../../../components/shared";
import { useQuery } from "react-query";
import { supabase } from "../../../config";
import { useContext } from "react";
import { AppContext } from "../../../appContext";
import {
  CharacterView,
  TagEntity,
  SupaUserProfile,
  CharacterWithProfileAndTag,
  ChatEntityWithCharacter,
} from "../../../types/backend-alias";

import { getBotAvatarUrl, getTimeAgo } from "../../../services/utils";
import { Link } from "react-router-dom";
import { ClockCircleOutlined, DeleteOutlined, WechatOutlined } from "@ant-design/icons";
import { PrivateIndicator } from "../../../components/PrivateIndicator";

const { Title } = Typography;

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

export const MyChats: React.FC = () => {
  const { profile } = useContext(AppContext);

  // Get character
  const { data, refetch, isLoading } = useQuery(
    ["chats", profile?.id],
    async () => {
      const responses = await supabase
        .from("chats")
        .select("*, characters(name, description, avatar)")
        .order("created_at", { ascending: false })
        .eq("user_id", profile?.id)
        .returns<ChatEntityWithCharacter[]>();

      const chats = responses.data;
      return chats;
    },
    { enabled: !!profile }
  );

  const deleteChat = async (chatId: number) => {
    await supabase.from("chats").delete().eq("id", chatId);
    refetch();
  };

  return (
    <PageContainer align="left">
      <Title level={2}>
        My Chats{" "}
        {data && (
          <span>
            (Total: {data.filter((c) => c.is_public).length} public,{" "}
            {data.filter((c) => !c.is_public).length} private)
          </span>
        )}
      </Title>

      {isLoading && <Spin />}
      {data && (
        <ChatContainer size="medium">
          {data.map((chat) => (
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
      )}
    </PageContainer>
  );
};
