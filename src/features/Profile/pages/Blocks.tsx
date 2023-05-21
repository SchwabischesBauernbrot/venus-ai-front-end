import { useContext } from "react";
import { Typography, Spin, App, Select } from "antd";

import { AppContext } from "../../../appContext";
import { PageContainer } from "../../../shared/components/shared";
import { Helmet } from "react-helmet";
import { SITE_NAME } from "../../../config";
import { getBlockedContent } from "../services/profile-service";
import { useQuery } from "react-query";
import { useTags } from "../../../hooks/useTags";
const { Title } = Typography;

export const Blocks = () => {
  const { message } = App.useApp();
  const { profile, setProfile } = useContext(AppContext);
  const tags = useTags();

  const { data, isLoading } = useQuery(["profile-blocked"], () => getBlockedContent(), {
    enabled: Boolean(profile),
  });

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
          <Title level={4}>Blocked Characters ({data.bots.length})</Title>

          <Title level={4}>Blocked Creators ({data.creators.length})</Title>

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
                <Select.Option key={tag.id} value={tag.id} label={tag.name}>
                  {tag.name} ({tag.description})
                </Select.Option>
              ))}
          </Select>
        </div>
      )}
    </PageContainer>
  );
};
