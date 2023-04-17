import { formatDistance, parseISO } from "date-fns";

import { SUPABASE_BUCKET_URL } from "../config";

export const randomID = () => Math.random().toString(36).substring(2, 8);

export const getAvatarUrl = (avatar?: string) =>
  avatar ? `${SUPABASE_BUCKET_URL}/avatars/${avatar}` : "";

export const getBotAvatarUrl = (avatar?: string) =>
  avatar ? `${SUPABASE_BUCKET_URL}/bot-avatars/${avatar}` : "";

export const getTimeAgo = (dateStr: string) => {
  const dateObj = parseISO(dateStr);
  const timeAgo = formatDistance(dateObj, new Date());
  return timeAgo;
};
