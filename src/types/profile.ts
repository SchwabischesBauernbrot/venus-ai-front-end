import { Json } from "./supabase";

export interface Profile {
  about_me: string;
  avatar: string;
  id: string;
  name: string;
  profile: string;
  user_name: string | null;
  is_verified?: boolean;
  config: Json;
}
