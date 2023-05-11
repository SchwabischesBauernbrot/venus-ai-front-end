import { useContext } from "react";
import { Typography, Spin, Button, App } from "antd";
import { Link } from "react-router-dom";
import { UserAddOutlined } from "@ant-design/icons";
import { Helmet } from "react-helmet";
import { useQuery } from "react-query";

import { PageContainer, CharacterList } from "../../../shared/components";
import { SITE_NAME, supabase } from "../../../config";
import { AppContext } from "../../../appContext";
import { CharacterView, CharacterWithProfileAndTag } from "../../../types/backend-alias";

const { Title } = Typography;

export const MyCharacters: React.FC = () => {
  const { profile } = useContext(AppContext);
  const { message } = App.useApp();

  // Get character
  const { data, isLoading, refetch } = useQuery(
    ["characters", profile?.id],
    async () => {
      const responses = await supabase
        .from("characters")
        .select("id, name, avatar, description, is_nsfw, is_public, tags(id, name, description)")
        .eq("creator_id", profile?.id)
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false })
        .returns<CharacterWithProfileAndTag[]>();

      const characters = responses.data;

      if (!characters) {
        return [];
      }

      const convertedCharacters: CharacterView[] = characters.map((character) => {
        const { tags } = character;

        return {
          ...character,
          creator_id: profile!.id,
          creator_name: profile!.user_name || profile!.name,
          creator_verified: profile!.is_verified || false,
          tags,
        };
      });

      return convertedCharacters;
    },
    { enabled: !!profile }
  );

  return (
    <PageContainer align="left">
      <Helmet>
        <title>{SITE_NAME} - My characters</title>
      </Helmet>

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
        {data && (
          <CharacterList
            characters={data}
            editable
            onCharacterDeleted={() => {
              message.success("Character deleted!");
              refetch();
            }}
          />
        )}
      </div>
    </PageContainer>
  );
};
