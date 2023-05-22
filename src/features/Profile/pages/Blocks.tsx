import { useCallback, useContext } from "react";
import { Typography, Spin, App, Select, List, Avatar, Tag } from "antd";

import { AppContext } from "../../../appContext";
import { PageContainer } from "../../../shared/components/shared";
import { Helmet } from "react-helmet";
import { SITE_NAME } from "../../../config";
import {
  DEFAULT_BLOCK_LIST,
  getBlockedContent,
  updateBlockList,
} from "../services/profile-service";
import { useQuery, useQueryClient } from "react-query";
import { useTags } from "../../../hooks/useTags";
import { CheckCircleOutlined } from "@ant-design/icons";
import { getAvatarUrl, getBotAvatarUrl } from "../../../shared/services/utils";
import { characterUrl, profileUrl } from "../../../shared/services/url-utils";
import { Link } from "react-router-dom";
const { Title } = Typography;

export const Blocks = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { profile } = useContext(AppContext);
  const tags = useTags();

  const { data, isLoading } = useQuery(["profile-blocked"], () => getBlockedContent(), {
    enabled: Boolean(profile),
  });

  const unblockCreator = useCallback(
    async (creatorId: string, creatorName: string) => {
      const currentBlockList = profile?.block_list || DEFAULT_BLOCK_LIST;
      currentBlockList.creators = currentBlockList.creators.filter((id) => id !== creatorId);
      await updateBlockList(currentBlockList, queryClient);

      message.success(`Creator ${creatorName} has been unblocked!`);
    },
    [profile]
  );

  const unblockCharacter = useCallback(
    async (characterId: string, characterName: string) => {
      const currentBlockList = profile?.block_list || DEFAULT_BLOCK_LIST;
      currentBlockList.bots = currentBlockList.bots.filter((id) => id !== characterId);
      await updateBlockList(currentBlockList, queryClient);

      message.success(`Character ${characterName} has been unblocked!`);
    },
    [profile]
  );

  console.log({ data, tags });

  return (
    <PageContainer align="left">
      <Helmet>
        <title>{SITE_NAME} - Block List</title>
      </Helmet>

      <Title level={2}>My blocks</Title>

      {isLoading && <Spin />}

      {data && (
        <div>
          <Title level={4}>Blocked Creators ({data.creators.length})</Title>
          <List
            itemLayout="horizontal"
            dataSource={data.creators}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a
                    key="unblock"
                    onClick={() => unblockCreator(item.id, item.user_name || item.name)}
                  >
                    <CheckCircleOutlined /> Unblock
                  </a>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={getAvatarUrl(item.avatar)} />}
                  title={
                    <Link to={profileUrl(item.id, item.user_name || item.name)}>
                      {item.user_name || item.name}
                    </Link>
                  }
                />
              </List.Item>
            )}
          />

          <Title level={4}>Blocked Tags ({data.tags.length})</Title>

          <Select
            style={{ minWidth: "30rem" }}
            mode="multiple"
            placeholder="Block a tag, or remove it from block list"
            optionLabelProp="label"
            value={data?.tags}
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLocaleLowerCase()
                .includes(input.toLocaleLowerCase())
            }
          >
            {tags &&
              tags.map((tag) => (
                <Select.Option key={tag.id} value={tag.id} label={tag.name} target="_blank">
                  {tag.name} ({tag.description})
                </Select.Option>
              ))}
          </Select>

          <Title level={4}>Blocked Characters ({data.bots.length})</Title>
          <List
            itemLayout="horizontal"
            dataSource={data.bots}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a key="unblock" onClick={() => unblockCharacter(item.id, item.name)}>
                    <CheckCircleOutlined /> Unblock
                  </a>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Link to={characterUrl(item.id, item.name)} target="_blank">
                      {item.name}
                    </Link>
                  }
                  description={
                    <span>
                      {item.is_nsfw ? <Tag color="error">🔞 NSFW</Tag> : ""}
                      {item.description}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </PageContainer>
  );
};
