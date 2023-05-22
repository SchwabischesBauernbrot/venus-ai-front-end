import { Typography, Spin, Col, Row, Avatar, Select, Button, Popconfirm, App } from "antd";
import styled from "styled-components";
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "react-query";
import { Link, useParams } from "react-router-dom";

import { axiosInstance } from "../../../config";
import { ProfileResponse } from "../../../types/backend-alias";
import { PageContainer, VerifiedMark } from "../../../shared/components/shared";
import { getAvatarUrl, getRealId, setPrerenderReady } from "../../../shared/services/utils";
import { MultiLineMarkdown } from "../../../shared/components";
import { CharacterListWrapper } from "../../../shared/components/CharacterListWrapper";
import { Helmet } from "react-helmet";
import { profileUrl } from "../../../shared/services/url-utils";
import { useCallback, useContext, useState } from "react";
import { MOBILE_BREAKPOINT_CSS } from "../../../css-const";
import { DEFAULT_BLOCK_LIST, isBlocked, updateBlockList } from "../services/profile-service";
import { AppContext } from "../../../appContext";

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

  const queryClient = useQueryClient();
  const { profile } = useContext(AppContext);
  const { message } = App.useApp();

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

  const blockCreator = useCallback(
    async (id: string) => {
      const currentBlockList = profile?.block_list || DEFAULT_BLOCK_LIST;
      currentBlockList.creators.push(id);
      await updateBlockList(currentBlockList, queryClient);

      message.success("This creator has been blocked!");
    },
    [profile]
  );

  const unblockCreator = useCallback(
    async (id: string) => {
      const currentBlockList = profile?.block_list || DEFAULT_BLOCK_LIST;
      currentBlockList.creators = currentBlockList.creators.filter((creatorId) => creatorId !== id);
      await updateBlockList(currentBlockList, queryClient);

      message.success("This creator has been unblocked!");
    },
    [profile]
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

            {isBlocked(profile?.block_list, "creators", data.id) ? (
              <Button icon={<CheckCircleOutlined />} onClick={() => unblockCreator(data.id)}>
                Unblock
              </Button>
            ) : (
              <Popconfirm
                title={
                  <div>
                    You will not see characters from this creator anymore! <br /> You can unblock it
                    later in <Link to="/blocks">Blocks</Link> menu.
                  </div>
                }
                onConfirm={() => blockCreator(data.id)}
              >
                <Button icon={<CloseCircleOutlined />}>Block this creator</Button>
              </Popconfirm>
            )}
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
