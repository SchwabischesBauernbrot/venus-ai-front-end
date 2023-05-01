import { useQuery } from "react-query";
import styled from "styled-components";
import { Typography, Spin, Space, Input, Button, Select, Tag, Tooltip, Switch } from "antd";

import { PageContainer } from "../../../shared/components/shared";
import { useTags } from "../../../hooks/useTags";
import { useMemo, useState } from "react";
import {
  CharacterListWrapper,
  SearchParams,
} from "../../../shared/components/CharacterListWrapper";

const { Title } = Typography;

const TagContainer = styled.div`
  .ant-tag {
    font-size: 1.25rem;
    line-height: 2.5rem;
  }
`;

export const SearchCharacter: React.FC = () => {
  const tags = useTags();

  const [searchParams, setSearchParams] = useState<SearchParams>({
    search: "",
    only_nsfw: false,
    sort: "latest",
  });

  const updateSearchParams = (params: SearchParams) => {
    setSearchParams({ ...searchParams, ...params });
  };

  const [search, setSearch] = useState("");

  return (
    <PageContainer align="left">
      <Title level={3} className="mb-4">
        Search for characters
      </Title>

      <Space.Compact block>
        <Input.Search
          defaultValue=""
          value={search}
          placeholder="Enter or click to search. Minimum 3 characters"
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => updateSearchParams({ search: value })}
        />

        <div style={{ width: "20rem", textAlign: "center" }}>
          <Switch
            className="mr-2"
            defaultChecked={searchParams.only_nsfw}
            onChange={(checked) => updateSearchParams({ only_nsfw: checked })}
          />
          <span style={{ position: "relative", top: "2px" }}>🔞 NSFW Only</span>
        </div>
        <Select
          style={{ width: "20rem" }}
          value={searchParams.sort}
          onChange={(value) => updateSearchParams({ sort: value })}
        >
          <Select.Option value="latest">Sort by latest</Select.Option>
          <Select.Option value="popular">Sort by most popular</Select.Option>
        </Select>
      </Space.Compact>

      {tags && (
        <TagContainer>
          <Space className="mt-4 " size={[2, 4]} wrap>
            {tags?.map((tag) => (
              <Tooltip key={tag.id} title={tag.description}>
                <Tag.CheckableTag
                  key={tag.id}
                  checked={tag.id === searchParams.tag_id}
                  onChange={() => {
                    if (tag.id === searchParams.tag_id) {
                      updateSearchParams({ tag_id: undefined });
                    } else {
                      updateSearchParams({ tag_id: tag.id });
                    }
                  }}
                >
                  {tag.name}
                </Tag.CheckableTag>
              </Tooltip>
            ))}
          </Space>
        </TagContainer>
      )}

      <CharacterListWrapper size="small" cachekey="search" additionalParams={searchParams} />
    </PageContainer>
  );
};
