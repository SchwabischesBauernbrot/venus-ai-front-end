import { Typography, Spin, Col, Row, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { axiosInstance } from "../../config";
import { CharacterView, ProfileRes } from "../../types/backend-alias";
import { PageContainer } from "../../components/shared";
import { getAvatarUrl } from "../../services/utils";
import { CharacterList } from "../../components/CharacterList";

const { Title } = Typography;

export const PublicProfile: React.FC = () => {
  const { profileId } = useParams();

  // Get character
  const { data, isLoading } = useQuery(
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

  return (
    <PageContainer>
      {isLoading && <Spin />}

      {data && (
        <Row>
          <Col span={4} className="text-left pt-4">
            {data.profile.avatar ? (
              <Avatar shape="square" size={100} src={getAvatarUrl(data.profile.avatar)} />
            ) : (
              <Avatar shape="square" size={100} icon={<UserOutlined />} />
            )}

            <Title level={3} className="my-2">
              @{data.profile.user_name || data.profile.name}
            </Title>
            {data.profile.about_me && <p>{data.profile.about_me}</p>}
          </Col>

          <Col span={20} className="text-left">
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
