import { Typography, message } from "antd";
import { PageContainer } from "../../../components/shared.components";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { supabase } from "../../../config";
import { useEffect } from "react";

export const ViewCharacter: React.FC = () => {
  // Get ID from here somehow
  const { characterId } = useParams();

  // Get character
  const { data } = useQuery(
    ["character", characterId],
    async () => {
      return await supabase.from("characters").select("*").eq("id", characterId).limit(1).single();
    },
    { enabled: !!characterId }
  );

  console.log(data);
  useEffect(() => {
    if (data?.error) {
      message.error("Can not find this character");
    }
  }, [data?.error]);

  return (
    <PageContainer>
      {data && data.data !== null && <code>{JSON.stringify(data, null, 2)}</code>}
    </PageContainer>
  );
};
