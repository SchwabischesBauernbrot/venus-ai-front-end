import { useEffect } from "react";
import styled from "styled-components";
import { Typography, message, Spin, Col, Row, Avatar, Card, Space, Tag, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";

import { axiosInstance, supabase } from "../../config";
import { CharacterView, ProfileRes } from "../../types/backend-alias";
import { PageContainer } from "../../components/shared.components";
import { getAvatarUrl, getBotAvatarUrl } from "../../services/utils";
import { CharacterList } from "../../components/CharacterList";

const { Meta } = Card;
const { Title } = Typography;

const CharacterContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  flex-wrap: wrap;
`;

const CharacterImage = styled.img`
  aspect-ratio: 1/1;
  object-fit: cover;
`;

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
              Public characters
            </Title>

            <CharacterList characters={data.characters} />
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};
