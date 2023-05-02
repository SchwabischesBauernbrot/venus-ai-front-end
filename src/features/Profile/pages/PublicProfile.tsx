import { Typography, Spin, Col, Row, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { axiosInstance } from "../../../config";
import { ProfileResponse } from "../../../types/backend-alias";
import { PageContainer } from "../../../shared/components/shared";
import { getAvatarUrl } from "../../../shared/services/utils";
import { MultiLineMarkdown } from "../../../shared/components";
import { CharacterListWrapper } from "../../../shared/components/CharacterListWrapper";

const { Title } = Typography;

export const PublicProfile: React.FC = () => {
  const { profileId } = useParams();

  // Get character
  const { data, isLoading } = useQuery(
    ["profile", profileId],
    async () => {
      const [profileResponse] = await Promise.all([
        axiosInstance.get<ProfileResponse>(`profiles/${profileId}`),
      ]);

      const profile = profileResponse.data;
      return profile;
    },
    { enabled: !!profileId }
  );

  return (
    <PageContainer>
      {isLoading && <Spin />}

      {data && (
        <Row gutter={16}>
          <Col lg={6} xs={24} className="text-left pt-4">
            {data.avatar ? (
              <Avatar shape="square" size={100} src={getAvatarUrl(data.avatar)} />
            ) : (
              <Avatar shape="square" size={100} icon={<UserOutlined />} />
            )}

            <Title level={3} className="my-2">
              @{data.user_name || data.name}
            </Title>
            {data.about_me && <MultiLineMarkdown>{data.about_me}</MultiLineMarkdown>}
          </Col>

          <Col lg={18} xs={24} className="text-left">
            <Title level={3} className="my-2">
              Public characters
            </Title>

            <CharacterListWrapper
              size="medium"
              cacheKey={`profile_chars_${profileId}`}
              additionalParams={{ user_id: profileId }}
            />
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};
