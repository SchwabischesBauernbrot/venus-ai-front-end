import { Typography } from "antd";
import { PageContainer } from "../../components/shared.components";
const { Title } = Typography;
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { supabase } from "../../config";
import { CharacterForm } from "./CharacterForm";

export const EditCharacter: React.FC = () => {
  // Get ID from here somehow
  const { characterId } = useParams();

  // Get character
  const { data } = useQuery(
    "profile",
    async () => {
      return await supabase.from("characters").select("*").eq("id", characterId).limit(1).single();
    },
    { enabled: !!characterId }
  );

  return (
    <PageContainer>
      <Title>Edit Character</Title>
      {data && data.data !== null && <CharacterForm id={data.data.id} values={data.data} />}
    </PageContainer>
  );
};
