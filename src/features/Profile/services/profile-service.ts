import { axiosInstance } from "../../../config";
import { ProfileResponse, ProfileUpdateDto } from "../../../types/backend-alias";
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
}: ProfileUpdateDto) => {
  const response = await axiosInstance.patch<ProfileResponse>("/profiles/mine", {
    about_me,
    avatar,
    name,
    profile,
    user_name,
    config,
  });
  const result = response.data;

  return result;
};

export const profileService = {
  getOwnProfile,
  updateProfile,
};
