import { Spin } from "antd";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { PageContainer } from "../../../components/shared";
import { axiosInstance, supabase } from "../../../config";
import { ChatResponse } from "../../../types/backend-alias";

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
      <code>{JSON.stringify(data, null, 2)}</code>
    </PageContainer>
  );
};
