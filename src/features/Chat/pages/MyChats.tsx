import { useContext } from "react";
import { Typography, Spin } from "antd";
import { useQuery } from "react-query";

import { PageContainer } from "../../../shared/components/shared";
import { supabase } from "../../../config";
import { AppContext } from "../../../appContext";
import { ChatEntityWithCharacter } from "../../../types/backend-alias";
import { ChatList } from "../../../shared/components/ChatList";

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
