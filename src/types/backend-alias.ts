import { components } from "./backend";
import { Database } from "./supabase";

export type CharacterView = components["schemas"]["CharacterView"];
export type FullCharacterView = components["schemas"]["FullChracterView"];
export type Tag = components["schemas"]["Tag"];
export type ProfileRes = components["schemas"]["ProfileResponse"];
export type ChatEntity = components["schemas"]["ChatEntity"];
export type ChatEntityWithCharacter = components["schemas"]["ChatEntityWithCharacter"];

export type ChatResponse = components["schemas"]["ChatResponse"];

export type SupaUserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type SupaCharacter = Database["public"]["Tables"]["characters"]["Row"];
export type SupaChat = Database["public"]["Tables"]["chats"]["Row"];
export type SupaTag = Database["public"]["Tables"]["tags"]["Row"];

export type CharacterWithProfileAndTag = SupaCharacter & { user_profiles: SupaUserProfile } & {
  tags: SupaTag[];
};
