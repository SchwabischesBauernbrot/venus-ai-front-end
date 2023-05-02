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
import { useEffect, useState } from "react";
import {
  searchCharacter,
  SearchCharactersParams,
} from "../../features/Character/services/character-service";

export type SearchParams = Omit<SearchCharactersParams, "page">;

interface CharacterListWrapperProps {
  size: "small" | "medium";
  cachekey: string;
  additionalParams?: SearchParams;
}

export const CharacterListWrapper: React.FC<CharacterListWrapperProps> = ({
  cachekey,
  size,
  additionalParams,
}) => {
  const [page, setPage] = useState(1);

  const { data } = useQuery([cachekey, additionalParams, page], async () => {
    const response = await searchCharacter({ page, ...additionalParams });
    return response;
  });

  useEffect(() => {
    setPage(1);
  }, [additionalParams]);

  if (!data) {
    return <Spin className="mt-4" />;
  }

  const { total, size: pageSize, data: characters } = data;

  const pagination = (
    <Pagination
      total={total}
      showTotal={(total) => (
        <span>
          Total <strong>{total}</strong> characters
        </span>
      )}
      defaultPageSize={pageSize}
      defaultCurrent={1}
      current={page}
      responsive={true}
      showSizeChanger={false} // Hide this as it will mess with the caching lol
      onChange={(newPage) => {
        setPage(newPage);
      }}
    />
  );

  return (
    <div className="mt-4">
      <p>
        Chats and messages count are updated <strong>every 5 minutes.</strong>
      </p>

      {pagination}

      <CharacterList size={size} characters={characters} />

      {pagination}
    </div>
  );
};
