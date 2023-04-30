import { Typography, Spin, Col, Row, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { axiosInstance } from "../../../config";
import { CharacterView, ProfileResponse } from "../../../types/backend-alias";
import { PageContainer } from "../../../shared/components/shared";
import { getAvatarUrl } from "../../../shared/services/utils";
import { CharacterList } from "../../../shared/components/CharacterList";
import { MultiLineMarkdown } from "../../../shared/components";

const { Title } = Typography;

export const PublicProfile: React.FC = () => {
  const { profileId } = useParams();

  // Get character
  const { data, isLoading } = useQuery(
    ["profile", profileId],
    async () => {
      const [profileResponse, profileCharacterResponse] = await Promise.all([
        axiosInstance.get<ProfileResponse>(`profiles/${profileId}`),
        axiosInstance.get<CharacterView[]>(`profiles/${profileId}/characters`),
      ]);

      const profile = profileResponse.data;
      const characters = profileCharacterResponse.data;
      return { profile, characters };
    },
    { enabled: !!profileId }
  );

  return (
    <PageContainer>
      {isLoading && <Spin />}

      {data && (
        <Row>
          <Col lg={4} xs={24} className="text-left pt-4">
            {data.profile.avatar ? (
              <Avatar shape="square" size={100} src={getAvatarUrl(data.profile.avatar)} />
            ) : (
              <Avatar shape="square" size={100} icon={<UserOutlined />} />
            )}

            <Title level={3} className="my-2">
              @{data.profile.user_name || data.profile.name}
            </Title>
            {data.profile.about_me && (
              <MultiLineMarkdown>{data.profile.about_me}</MultiLineMarkdown>
            )}
          </Col>

          <Col lg={20} xs={24} className="text-left">
            <Title level={3} className="my-2">
              Public characters (Total: {data.characters.length} characters)
            </Title>

            <CharacterList characters={data.characters} />
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};
