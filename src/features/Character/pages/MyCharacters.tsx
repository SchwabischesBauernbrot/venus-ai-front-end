import { Typography, Spin, Button } from "antd";
import { PageContainer } from "../../../shared/components/shared";
import { useQuery } from "react-query";
import { supabase } from "../../../config";
import { useContext } from "react";
import { AppContext } from "../../../appContext";
import {
  CharacterView,
  TagEntity,
  SupaUserProfile,
  CharacterWithProfileAndTag,
} from "../../../types/backend-alias";
import { CharacterList } from "../../../shared/components/CharacterList";
import { Link } from "react-router-dom";
import { UserAddOutlined } from "@ant-design/icons";

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
        .eq("creator_id", profile?.id)
        .order("created_at", { ascending: false })
        .returns<CharacterWithProfileAndTag[]>();

      const characters = responses.data;

      if (!characters) {
        return [];
      }

      const convertedCharacters: CharacterView[] = characters.map((character) => {
        const { user_profiles, tags } = character;

        return {
          ...character,
          creator_id: user_profiles.id,
          creator_name: user_profiles.user_name || user_profiles.name,
          tags,
        };
      });

      return convertedCharacters;
    },
    { enabled: !!profile }
  );

  return (
    <PageContainer align="left">
      <Title level={2}>
        My Characters{" "}
        {data && (
          <span>
            (Total: {data.filter((c) => c.is_public).length} public,{" "}
            {data.filter((c) => !c.is_public).length} private)
          </span>
        )}
      </Title>

      <Link to="/create_character">
        <Button type="primary" size="large">
          <UserAddOutlined /> Create Character
        </Button>
      </Link>

      <div className="mt-4">
        {isLoading && <Spin />}
        {data && <CharacterList characters={data} editable />}
      </div>
    </PageContainer>
  );
};
