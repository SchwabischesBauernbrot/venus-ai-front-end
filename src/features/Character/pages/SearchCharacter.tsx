import styled from "styled-components";
import { Helmet } from "react-helmet";
import { Typography, Space, Input, Select, Tag, Tooltip, Row, Col, Radio } from "antd";

import { PageContainer } from "../../../shared/components/shared";
import { useTags } from "../../../hooks/useTags";
import { useContext, useState } from "react";
import {
  CharacterListWrapper,
  SearchParams,
} from "../../../shared/components/CharacterListWrapper";
import { MOBILE_BREAKPOINT_CSS } from "../../../css-const";
import { EyeFilled, EyeInvisibleFilled, HeartFilled } from "@ant-design/icons";
import { AppContext } from "../../../appContext";
import { SITE_NAME } from "../../../config";

const { Title } = Typography;

const TagContainer = styled.div`
  .ant-tag {
    font-size: 1.25rem;
    line-height: 2rem;

    ${MOBILE_BREAKPOINT_CSS} {
      font-size: 0.8rem;
      line-height: 1.25rem;
    }
  }
`;

export const SearchCharacter: React.FC = () => {
  const { localData } = useContext(AppContext);
  const tags = useTags();

  const [searchParams, setSearchParams] = useState<SearchParams>({
    search: "",
    mode: localData.character_view || "sfw",
    sort: "latest",
  });

  const updateSearchParams = (params: SearchParams) => {
    setSearchParams({ ...searchParams, ...params });
  };

  const [search, setSearch] = useState("");

  return (
    <PageContainer align="left">
      <Helmet>
        <title>{SITE_NAME} - Search for characters</title>
      </Helmet>

      <Title level={3} className="mb-4">
        Search for characters
      </Title>

      <Row gutter={[0, 16]}>
        <Col xs={24} lg={7} className="text-left">
          <Radio.Group
            defaultValue={searchParams.mode}
            onChange={(e) => updateSearchParams({ mode: e.target.value })}
          >
            <Radio.Button value="all">
              <EyeFilled /> All
            </Radio.Button>
            <Radio.Button value="sfw">
              <EyeInvisibleFilled /> SFW Only
            </Radio.Button>
            <Radio.Button value="nsfw">
              <HeartFilled /> NSFW Only
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col xs={24} lg={12}>
          <Input.Search
            defaultValue=""
            value={search}
            placeholder="Enter or click to search"
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => updateSearchParams({ search: value })}
          />
        </Col>

        <Col xs={24} lg={5}>
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
          <Space className="mt-4 " size={[2, 8]} wrap>
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

      <CharacterListWrapper size="small" cacheKey="search" additionalParams={searchParams} />
    </PageContainer>
  );
};
