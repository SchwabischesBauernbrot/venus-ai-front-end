import { axiosInstance } from "../../../config";
import { ProfileResponse, ProfileUpdateDto } from "../../../types/backend-alias";

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
  updateProfile,
};
