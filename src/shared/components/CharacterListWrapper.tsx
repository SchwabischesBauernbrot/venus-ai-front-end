import { Spin, Pagination } from "antd";

import { useQuery } from "react-query";
import { CharacterList } from "./CharacterList";
import { useEffect, useState } from "react";
import {
  searchCharacter,
  SearchCharactersParams,
} from "../../features/Character/services/character-service";

export type SearchParams = Omit<SearchCharactersParams, "page">;

interface CharacterListWrapperProps {
  size: "small" | "medium";
  cacheKey: string;
  additionalParams?: SearchParams;
}

export const CharacterListWrapper: React.FC<CharacterListWrapperProps> = ({
  cacheKey,
  size,
  additionalParams,
}) => {
  const [page, setPage] = useState(1);

  const { data } = useQuery([cacheKey, additionalParams, page], async () => {
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
      showQuickJumper
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
