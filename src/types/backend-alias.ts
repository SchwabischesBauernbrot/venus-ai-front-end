import { components } from "./backend";
import { Database } from "./supabase";

export type CharacterView = components["schemas"]["CharacterView"];
export type FullCharacterView = components["schemas"]["FullCharacterView"];
export type ReviewView = components["schemas"]["ReviewView"];

export type ProfileResponse = components["schemas"]["ProfileResponse"];
export type ChatEntity = components["schemas"]["ChatEntity"];
export type ChatMessageEntity = components["schemas"]["ChatMessageEntity"];
export type TagEntity = components["schemas"]["TagEntity"];
export type ChatEntityWithCharacter = components["schemas"]["ChatEntityWithCharacter"];

export type ChatResponse = components["schemas"]["ChatResponse"];

export type ProfileUpdateDto = components["schemas"]["ProfileUpdateDto"];
export type UpdateChatDto = components["schemas"]["UpdateChatDto"];
export type CreateChatMessageDto = components["schemas"]["CreateChatMessageDto"];
export type UpdateChatMessageDto = components["schemas"]["UpdateChatMessageDto"];
export type CreateReviewDto = components["schemas"]["CreateReviewDto"];

export type SupaUserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type SupaCharacter = Database["public"]["Tables"]["characters"]["Row"];
export type SupaChat = Database["public"]["Tables"]["chats"]["Row"];
export type SupaChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
export type SupaTag = Database["public"]["Tables"]["tags"]["Row"];
export type SupaReview = Database["public"]["Tables"]["reviews"]["Row"];

export type CharacterWithProfileAndTag = SupaCharacter & { user_profiles: SupaUserProfile } & {
  tags: SupaTag[];
};

export interface Paginated<T> {
  data: Array<T>;
  total: number;
  size: number;
  page: number;
}
