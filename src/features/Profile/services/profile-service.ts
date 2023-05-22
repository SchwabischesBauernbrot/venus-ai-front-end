import { QueryClient } from "react-query";
import { axiosInstance } from "../../../config";
import {
  BlockedContent,
  BlockList,
  ProfileResponse,
  ProfileUpdateDto,
} from "../../../types/backend-alias";
import { Profile } from "../../../types/profile";

const getOwnProfile = async () => {
  const response = await axiosInstance.get<Profile>("/profiles/mine");
  return response.data;
};

const updateProfile = async ({
  about_me,
  avatar,
  name,
  profile,
  user_name,
  config,
  block_list,
}: ProfileUpdateDto) => {
  const response = await axiosInstance.patch<ProfileResponse>("/profiles/mine", {
    about_me,
    avatar,
    name,
    profile,
    user_name,
    config,
    block_list,
  });
  const result = response.data;

  return result;
};

export const DEFAULT_BLOCK_LIST: BlockList = {
  bots: [],
  creators: [],
  tags: [],
};

export const updateBlockList = async (newBlockList: BlockList, queryClient: QueryClient) => {
  const result = await updateProfile({ block_list: newBlockList });

  await Promise.all([
    queryClient.invalidateQueries("profile"),
    queryClient.invalidateQueries("profile-blocked"),
  ]);

  return result;
};

export const getBlockedContent = async () => {
  const blockedContent = await axiosInstance.get<BlockedContent>("/profiles/mine/blocked");

  return blockedContent.data;
};

export const isBlocked = (
  blockList: Profile["block_list"],
  type: keyof BlockList,
  id: string | number
) => {
  if (!blockList) {
    return false;
  }

  const bList = blockList || DEFAULT_BLOCK_LIST;
  if (type === "tags" && typeof id === "number") {
    return bList["tags"].includes(id);
  }

  if ((type === "bots" || type === "creators") && typeof id === "string") {
    return bList[type].includes(id);
  }

  return false;
};

export const profileService = {
  getOwnProfile,
  getBlockedContent,
  updateProfile,
  isBlocked,
};
