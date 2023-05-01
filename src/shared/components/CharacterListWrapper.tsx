import { EditOutlined } from "@ant-design/icons";
import { Card, Space, Tooltip, Tag, Spin, Pagination } from "antd";
import Meta from "antd/es/card/Meta";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { truncate } from "lodash-es";

import { getBotAvatarUrl } from "../services/utils";
import { CharacterView, Paginated } from "../../types/backend-alias";
import { PrivateIndicator } from "./PrivateIndicator";
import { useQuery } from "react-query";
import { axiosInstance } from "../../config";
import { CharacterList } from "./CharacterList";
import { useState } from "react";

interface CharacterListWrapperProps {
  // paging?
  baseUrl: string;
  size: "small" | "medium";

  // show paging?
  cachekey: string;
  ordering?: any; // created_time, popularity
  query?: any; // search lol
  filter?: any; // by tag or something
}

export const CharacterListWrapper: React.FC<CharacterListWrapperProps> = ({
  baseUrl,
  cachekey,
  size,
}) => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery([cachekey, page], async () => {
    const response = await axiosInstance.get<Paginated<CharacterView>>(`${baseUrl}?page=${page}`);
    return response.data;
  });

  if (!data) {
    return <Spin />;
  }

  const { total, size: pageSize, data: characters } = data;

  return (
    <div>
      <Pagination
        total={total}
        showTotal={(total) => `Total ${total} characters`}
        defaultPageSize={pageSize}
        defaultCurrent={1}
        current={page}
        responsive={true}
        showSizeChanger={false} // Hide this as it will mess with the caching lol
        onChange={(newPage) => {
          setPage(newPage);
        }}
      />

      <CharacterList size={size} characters={characters} />
    </div>
  );
};
