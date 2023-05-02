import { formatDistance, parseISO, format } from "date-fns";

import { SUPABASE_BUCKET_URL } from "../../config";

export const randomID = () => Math.random().toString(36).substring(2, 8);

export const getAvatarUrl = (avatar?: string) =>
  avatar
    ? `${SUPABASE_BUCKET_URL}/avatars/${avatar}`
    : `${SUPABASE_BUCKET_URL}/bot-avatars/anon.jpg`;

export const getBotAvatarUrl = (avatar?: string) =>
  avatar ? `${SUPABASE_BUCKET_URL}/bot-avatars/${avatar}` : "";

export const getTimeAgo = (dateStr: string) => {
  const dateObj = parseISO(dateStr);
  const timeAgo = formatDistance(dateObj, new Date());
  return timeAgo;
};

export const formatTime = (dateTimeString: string) => {
  const formattedDateTimeString = format(new Date(dateTimeString), "dd MMM yyyy, h:mm a"); // 19 Oct 2021, 12:34 PM
  return formattedDateTimeString;
};

export const copyToClipboard = (text: string) => {
  const tempElement = document.createElement("textarea");
  tempElement.value = text;
  document.body.appendChild(tempElement);
  tempElement.select();

  // https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative
  document.execCommand("copy");
  document.body.removeChild(tempElement);
};
