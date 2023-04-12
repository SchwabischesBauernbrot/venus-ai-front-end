import { Typography, Spin } from "antd";
import { PageContainer } from "../../../components/shared";
import { useQuery } from "react-query";
import { supabase } from "../../../config";
import { useContext } from "react";
import { AppContext } from "../../../appContext";
import { CharacterView, Tag, SupaUserProfile } from "../../../types/backend-alias";
import { CharacterList } from "../../../components/CharacterList";

const { Title } = Typography;

export const MyCharacters: React.FC = () => {
  const { profile } = useContext(AppContext);

  // Get character
  const { data, isLoading } = useQuery(
    ["characters", profile?.id],
    async () => {
      const responses = await supabase
        .from("characters")
        .select("*, tags(*), user_profiles(*)")
        .eq("creator_id", profile?.id);

      const characters = Array.isArray(responses.data) ? responses.data : [];

      const convertedCharacters: CharacterView[] = characters.map((character) => {
        const userProfile: SupaUserProfile = character.user_profiles as any;
        const tags: Tag[] = character.tags as any;
        return {
          ...character,
          creator_id: userProfile.id,
          creator_name: userProfile.user_name || userProfile.name,
          tags,
        };
      });

      return convertedCharacters;
    },
    { enabled: !!profile }
  );

  return (
    <PageContainer align="left">
      <Title level={2}>My Characters</Title>

      {isLoading && <Spin />}
      {data && <CharacterList characters={data} editable />}
    </PageContainer>
  );
};
