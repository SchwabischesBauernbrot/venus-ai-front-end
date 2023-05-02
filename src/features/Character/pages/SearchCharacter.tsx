import { useQuery } from "react-query";
import styled from "styled-components";
import {
  Typography,
  Spin,
  Space,
  Input,
  Button,
  Select,
  Tag,
  Tooltip,
  Switch,
  Row,
  Col,
} from "antd";

import { PageContainer } from "../../../shared/components/shared";
import { useTags } from "../../../hooks/useTags";
import { useMemo, useState } from "react";
import {
  CharacterListWrapper,
  SearchParams,
} from "../../../shared/components/CharacterListWrapper";
import { MOBILE_BREAKPOINT_CSS } from "../../../css-const";

const { Title } = Typography;

const TagContainer = styled.div`
  .ant-tag {
    font-size: 1.25rem;
    line-height: 2.5rem;

    ${MOBILE_BREAKPOINT_CSS} {
      font-size: 0.8rem;
      line-height: 1.25rem;
    }
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

      <Row>
        <Col xs={24} lg={12}>
          <Input.Search
            defaultValue=""
            value={search}
            placeholder="Enter or click to search"
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => updateSearchParams({ search: value })}
          />
        </Col>
        <Col xs={24} lg={6} className="text-center">
          <Switch
            className="mr-2"
            defaultChecked={searchParams.only_nsfw}
            onChange={(checked) => updateSearchParams({ only_nsfw: checked })}
          />
          <span style={{ position: "relative", top: "2px" }}>🔞 NSFW Only</span>
        </Col>
        <Col xs={24} lg={6}>
          <Select
            style={{ width: "100%" }}
            value={searchParams.sort}
            onChange={(value) => updateSearchParams({ sort: value })}
          >
            <Select.Option value="latest">Sort by latest</Select.Option>
            <Select.Option value="popular">Sort by most popular</Select.Option>
          </Select>
        </Col>
      </Row>

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
