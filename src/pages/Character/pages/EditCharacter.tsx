import { Typography } from "antd";
import { useMemo } from "react";
import { PageContainer } from "../../../components/shared.components";
const { Title } = Typography;
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../config";
import { Tag } from "../../../types/backend-alias";
import { CharacterForm } from "../components/CharacterForm";

export const EditCharacter: React.FC = () => {
  // Get ID from here somehow
  const { characterId } = useParams();

  // Get character
  const { data } = useQuery(
    ["character", characterId],
    async () => {
      const result = await supabase
        .from("characters")
        .select("*, tags(*)")
        .eq("id", characterId)
        .limit(1)
        .single();

      return result;
    },
    { enabled: !!characterId }
  );

  const editData = useMemo(() => {
    if (data?.data) {
      const tags: Tag[] = data.data.tags || [];
      const copy = { ...data.data, tag_ids: tags.map((tag) => tag.id) };
      return copy;
    }

    return undefined;
  }, [data]);

  return (
    <PageContainer>
      <Title>
        Edit Character <Link to={`/character/${characterId}`}>(View)</Link>{" "}
      </Title>
      {editData && <CharacterForm id={editData.id} values={editData} />}
    </PageContainer>
  );
};
