import { useMemo } from "react";
import { Spin, Typography } from "antd";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";

import { SITE_NAME, supabase } from "../../../config";
import { PageContainer } from "../../../shared/components/shared";
import { CharacterForm } from "../components/CharacterForm";
import { Helmet } from "react-helmet";
import { characterUrl } from "../../../shared/services/url-utils";

const { Title } = Typography;

export const EditCharacter: React.FC = () => {
  const { characterId } = useParams();

  // Get character
  const { data, isLoading } = useQuery(
    ["character", characterId],
    async () => {
      const result = await supabase
        .from("characters")
        .select("*, tags(id)")
        .eq("id", characterId)
        .limit(1)
        .single();

      return result;
    },
    { enabled: !!characterId }
  );

  const editData = useMemo(() => {
    if (data?.data) {
      const tags = Array.isArray(data.data.tags) ? data.data.tags : [];
      const copy = { ...data.data, tag_ids: tags.map((tag) => tag.id) };
      return copy;
    }

    return undefined;
  }, [data]);

  return (
    <PageContainer>
      <Helmet>
        <title>{SITE_NAME} - Edit character</title>
      </Helmet>
      <Title level={2}>
        Edit Character{" "}
        <Link to={editData ? characterUrl(editData?.id, editData?.name) : "/"}>
          (View Character)
        </Link>
      </Title>

      {isLoading && <Spin />}
      {editData && <CharacterForm id={editData.id} values={editData} />}
    </PageContainer>
  );
};
