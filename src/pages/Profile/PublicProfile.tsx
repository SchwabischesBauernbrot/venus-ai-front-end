import { Typography, message } from "antd";

import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { useEffect } from "react";
import { axiosInstance, supabase } from "../../config";
import { CharacterView, ProfileRes } from "../../types/backend-alias";
import { PageContainer } from "../../components/shared.components";

export const PublicProfile: React.FC = () => {
  // Get ID from here somehow
  const { profileId } = useParams();

  // Get character
  const { data } = useQuery(
    ["profile", profileId],
    async () => {
      const [profileResponse, profileCharacterResponse] = await Promise.all([
        axiosInstance.get<ProfileRes>(`profiles/${profileId}`),
        axiosInstance.get<CharacterView[]>(`profiles/${profileId}/characters`),
      ]);

      const profile = profileResponse.data;
      const characters = profileCharacterResponse.data;
      return { profile, characters };
    },
    { enabled: !!profileId }
  );

  return <PageContainer>{data && <code>{JSON.stringify(data, null, 2)}</code>}</PageContainer>;
};
