import { useQuery } from "react-query";
import styled from "styled-components";
import { Typography, Spin, Segmented, Space, Input, Button, Select, Tag, Tooltip } from "antd";

import { PageContainer } from "../../../shared/components/shared";
import { useTags } from "../../../hooks/useTags";

const { Title } = Typography;
export const SearchCharacter: React.FC = () => {
  const tags = useTags();

  return (
    <PageContainer align="left">
      <Title level={3} className="mb-4">
        Search for characters
      </Title>

      <Space.Compact block>
        <Input.Search defaultValue="" />
        <Select style={{ width: "15rem" }} value="latest">
          <Select.Option value="latest">Sort by latest</Select.Option>
          <Select.Option value="popular">Sort by most popular</Select.Option>
        </Select>
      </Space.Compact>

      {tags && (
        <Space className="mt-4 " size={[2, 4]} wrap>
          <Tag>🔞 NSFW</Tag>
          {tags?.map((tag) => (
            <Tooltip key={tag.id} title={tag.description}>
              <Tag>{tag.name}</Tag>
            </Tooltip>
          ))}
        </Space>
      )}
    </PageContainer>
  );
};
