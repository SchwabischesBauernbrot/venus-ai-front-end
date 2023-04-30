import { useQuery } from "react-query";
import { Typography, Spin } from "antd";

import { PageContainer } from "../../../shared/components/shared";
import { axiosInstance, supabase } from "../../../config";
import { CharacterView, ChatEntityWithCharacter } from "../../../types/backend-alias";
import { CharacterList } from "../../../shared/components/CharacterList";
import { useContext } from "react";
import { AppContext } from "../../../appContext";
import { ChatList } from "../../../shared/components";

const { Title } = Typography;

export const Home: React.FC = () => {
  const { profile } = useContext(AppContext);

  const { data: chatData, isLoading: isChatLoading } = useQuery(
    ["chats", profile?.id],
    async () => {
      const responses = await supabase
        .from("chats")
        .select("*, characters(name, description, avatar)")
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false })
        .eq("user_id", profile?.id)
        .limit(4)
        .returns<ChatEntityWithCharacter[]>();

      const chats = responses.data;
      return chats?.filter((chat) => chat.characters); // Character can be null if deleted or privated
    },
    { enabled: !!profile }
  );

  const { data, isLoading } = useQuery("main_page", async () => {
    const response = await axiosInstance.get<CharacterView[]>("characters/home");
    return response.data;
  });

  return (
    <PageContainer align="left">
      {profile && (
        <div className="mb-4">
          <Title level={2}>Continue Chats</Title>
          {chatData && <ChatList size="small" chats={chatData} />}
        </div>
      )}

      <Title level={2}>Latest characters</Title>
      {isLoading && <Spin />}
      {data && <CharacterList size="small" characters={data} />}
    </PageContainer>
  );
};
