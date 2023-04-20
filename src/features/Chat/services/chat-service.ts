import { axiosInstance, supabase } from "../../../config";
import { UserConfig } from "../../../shared/services/user-config";
import { UserLocalData } from "../../../shared/services/user-local-data";
import {
  ChatEntity,
  ChatMessageEntity,
  ChatResponse,
  CreateChatMessageDto,
  UpdateChatDto,
  UpdateChatMessageDto,
} from "../../../types/backend-alias";

type ChatID = number | string | undefined;

const createChat = async (characterId: string) => {
  const newChat = await axiosInstance.post<ChatEntity>("chats", {
    character_id: characterId,
  });
  return newChat.data;
};

const updateChat = async (chatId: ChatID, { is_public, summary }: UpdateChatDto) => {
  const updatedChat = await axiosInstance.patch<ChatEntity>(`chats/${chatId}`, {
    is_public,
    summary,
  });
  return updatedChat.data;
};

const deleteChat = async (chatId: ChatID) => {
  await supabase.from("chats").delete().eq("id", chatId);
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
  { message, is_bot, is_main }: CreateChatMessageDto
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
  messageId: number,
  { message, is_main }: UpdateChatMessageDto
) => {
  const messageResponse = await axiosInstance.patch<ChatMessageEntity>(
    `/chats/${chatId}/messages/${messageId}`,
    {
      message: message,
      is_main,
    }
  );
  return messageResponse.data;
};

const readyToChat = (config?: UserConfig, localData: UserLocalData) => {
  if (!config) {
    return false;
  }

  if (config.api === "openai" && localData.openAIKey) {
    return true;
  }

  if ((config.api === "kobold" || config.api === "ooba") && config.api_url) {
    return true;
  }
  return false;
};

export const chatService = {
  createChat,
  deleteChat,
  getChatById,
  createMessage,
  updateChat,
  updateMassage,
  deleteMessages,
  readyToChat,
};
