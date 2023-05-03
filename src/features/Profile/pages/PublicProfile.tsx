import { Typography, Spin, Col, Row, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { axiosInstance } from "../../../config";
import { ProfileResponse } from "../../../types/backend-alias";
import { PageContainer } from "../../../shared/components/shared";
import { getAvatarUrl, getRealId } from "../../../shared/services/utils";
import { MultiLineMarkdown } from "../../../shared/components";
import { CharacterListWrapper } from "../../../shared/components/CharacterListWrapper";
import { Helmet } from "react-helmet";

const { Title } = Typography;

export const PublicProfile: React.FC = () => {
  const { profileId: seoFriendlyId } = useParams();
  const profileId = getRealId(seoFriendlyId || "");

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
        <Helmet>
          <title>{`Creator Profile @${data.user_name || data.name}. Bot made by ${
            data.user_name || data.name
          }.`}</title>
          <meta
            property="og:title"
            content={`Creator Profile @${data.user_name || data.name}. Bots made by ${
              data.user_name || data.name
            }.`}
          />
          <meta
            property="og:description"
            content={`Creator Profile @${data.user_name || data.name} - ${data.about_me}`}
          />
          <meta
            name="description"
            content={`Creator Profile @${data.user_name || data.name} - ${data.about_me}`}
          />
          <meta property="og:image" content={getAvatarUrl(data.avatar)} />
        </Helmet>
      )}

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
