import { useContext } from "react";
import { Typography, Spin } from "antd";
import { useQuery } from "react-query";

import { PageContainer } from "../../../shared/components/shared";
import { SITE_NAME, supabase } from "../../../config";
import { AppContext } from "../../../appContext";
import { ChatEntityWithCharacter } from "../../../types/backend-alias";
import { ChatList } from "../../../shared/components/ChatList";
import { Helmet } from "react-helmet";

const { Title } = Typography;

export const MyChats: React.FC = () => {
  const { profile } = useContext(AppContext);

  // Get all chats
  const { data, refetch, isLoading } = useQuery(
    ["chats", profile?.id],
    async () => {
      const responses = await supabase
        .from("chats")
        .select("*, characters(name, description, avatar)")
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false })
        .eq("user_id", profile?.id)
        .returns<ChatEntityWithCharacter[]>();

      const chats = responses.data;
      return chats?.filter((chat) => chat.characters); // Character can be null if deleted or privated
    },
    { enabled: !!profile }
  );

  return (
    <PageContainer align="left">
      <Helmet>
        <title>{SITE_NAME} - My Chats</title>
      </Helmet>
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
      {data && <ChatList chats={data} onChatDeleted={() => refetch()} />}
    </PageContainer>
  );
};
