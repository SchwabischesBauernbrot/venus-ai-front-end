import { components } from "./backend";
import { Database } from "./supabase";

export type CharacterView = components["schemas"]["CharacterView"] & { is_public?: boolean };
export type Tag = components["schemas"]["Tag"];
export type ProfileRes = components["schemas"]["ProfileResponse"];

export type SupaUserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type SupaCharacter = Database["public"]["Tables"]["characters"]["Row"];
