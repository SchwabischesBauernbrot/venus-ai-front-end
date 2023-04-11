import { SUPABASE_BUCKET_URL } from "../config";

export const randomID = () => Math.random().toString(36).substring(2, 8);

export const getAvatarUrl = (avatar: string) => `${SUPABASE_BUCKET_URL}/avatars/${avatar}` || "";

export const getBotAvatarUrl = (avatar: string) =>
  `${SUPABASE_BUCKET_URL}/bot-avatars/${avatar}` || "";
