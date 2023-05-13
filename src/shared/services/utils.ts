import { formatDistance, parseISO, format } from "date-fns";

import { SUPABASE_BUCKET_URL } from "../../config";
import { kebabCase } from "lodash-es";

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

export const formatNumber = (number: number) => {
  if (number < 1000) {
    return number.toString();
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1) + "k";
  } else {
    return (number / 1000000).toFixed(1) + "m";
  }
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

// Input: [id/uuid]_[seo_friendly_part]
// Output: [id/uuid]
export const getRealId = (seoFriendlyId?: string) => {
  if (!seoFriendlyId) {
    return undefined;
  }

  const underscoreIndex = seoFriendlyId.indexOf("_");
  if (underscoreIndex === -1) {
    return seoFriendlyId;
  }

  return seoFriendlyId.substring(0, underscoreIndex);
};

export const toSlug = (input?: string) => {
  if (!input) return "";
  return kebabCase(input).trim();
};

export const getPage = (page: string | null) => {
  return parseInt(page || "1") || 1;
};
