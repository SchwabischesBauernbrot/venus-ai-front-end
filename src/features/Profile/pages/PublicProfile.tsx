import { Typography, Spin, Col, Row, Avatar, Select } from "antd";
import styled from "styled-components";
import { UserOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { axiosInstance } from "../../../config";
import { ProfileResponse } from "../../../types/backend-alias";
import { PageContainer, VerifiedMark } from "../../../shared/components/shared";
import { getAvatarUrl, getRealId, setPrerenderReady } from "../../../shared/services/utils";
import { MultiLineMarkdown } from "../../../shared/components";
import { CharacterListWrapper } from "../../../shared/components/CharacterListWrapper";
import { Helmet } from "react-helmet";
import { profileUrl } from "../../../shared/services/url-utils";
import { useState } from "react";
import { MOBILE_BREAKPOINT_CSS } from "../../../css-const";

const { Title } = Typography;

const SortContainer = styled.div`
  text-align: right;
  display: block;
  position: relative;
  top: 0.75rem;
  height: 0;

  ${MOBILE_BREAKPOINT_CSS} {
    top: 4.75rem;
  }
`;

export const PublicProfile: React.FC = () => {
  const { profileId: seoFriendlyId } = useParams();
  const [sortValue, setSortValue] = useState<"latest" | "popular">("latest");
  const profileId = getRealId(seoFriendlyId || "");

  // Get character
  const { data, isLoading } = useQuery(
    ["profile", profileId],
    async () => {
      const profileResponse = await axiosInstance.get<ProfileResponse>(`/profiles/${profileId}`);

      const profile = profileResponse.data;
      return profile;
    },
    {
      enabled: !!profileId,
      onSuccess(data) {
        if (data) {
          setPrerenderReady();
        }
      },
    }
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
          <link
            rel="canonical"
            href={`${location.origin}${profileUrl(data.id, data.user_name || data.name)}`}
          />
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
              @{data.user_name || data.name} {data.is_verified && <VerifiedMark size="large" />}
            </Title>
            {data.about_me && <MultiLineMarkdown>{data.about_me}</MultiLineMarkdown>}
          </Col>

          <Col lg={18} xs={24} className="text-left">
            <Title level={3} className="my-2">
              Public characters
            </Title>

            <SortContainer>
              <Select
                style={{ minWidth: "12rem", textAlign: "left" }}
                value={sortValue}
                onChange={(value) => setSortValue(value)}
              >
                <Select.Option value="latest">Sort by latest</Select.Option>
                <Select.Option value="popular">Sort by most popular</Select.Option>
              </Select>
            </SortContainer>

            <CharacterListWrapper
              size="medium"
              cacheKey={`profile_chars_${profileId}`}
              additionalParams={{ user_id: profileId, sort: sortValue }}
            />
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};
