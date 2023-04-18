import { axiosInstance } from "../../config";
import { ChatMessageEntity, ChatResponse } from "../../types/backend-alias";

type ChatID = number | string | undefined;
interface CreateMessagePayload {
  message: string;
  is_bot: boolean;
  is_main: boolean;
}

type EditMessagePayload = Pick<CreateMessagePayload, "message" | "is_main"> & {
  message_id: number;
};

const getChatById = async (chatId: ChatID) => {
  const chatResponse = await axiosInstance.get<ChatResponse>(`/chats/${chatId}`);
  return chatResponse.data;
};

const deleteMessages = async (chatId: ChatID, messageIDs: number[]) => {
  return await axiosInstance.delete(`/chats/${chatId}/messages`, {
    data: {
      message_ids: messageIDs,
    },
  });
};

const createMessage = async (
  chatId: ChatID,
  { message, is_bot, is_main }: CreateMessagePayload
) => {
  const messageResponse = await axiosInstance.post<ChatMessageEntity>(`/chats/${chatId}/messages`, {
    message,
    is_bot,
    is_main,
  });
  return messageResponse.data;
};

const updateMassage = async (
  chatId: ChatID,
  { message_id, message, is_main }: EditMessagePayload
) => {
  const messageResponse = await axiosInstance.patch<ChatMessageEntity>(
    `/chats/${chatId}/messages/${message_id}`,
    {
      message: message,
      is_main,
    }
  );
  return messageResponse.data;
};

export const chatService = {
  getChatById,
  createMessage,
  updateMassage,
  deleteMessages,
};
