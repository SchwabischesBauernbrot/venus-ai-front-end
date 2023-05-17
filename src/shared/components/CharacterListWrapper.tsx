import { Spin, Pagination } from "antd";

import { useQuery } from "react-query";
import { CharacterList } from "./CharacterList";
import { useEffect, useMemo, useState } from "react";
import {
  searchCharacter,
  SearchCharactersParams,
} from "../../features/Character/services/character-service";
import { setPrerenderReady } from "../services/utils";

export type SearchParams = Omit<SearchCharactersParams, "page">;

interface CharacterListWrapperProps {
  size: "small" | "medium";
  cacheKey: string;
  additionalParams?: SearchParams;

  // If there is no onPageChange, component manage page state itself
  page?: number;
  onPageChange?: (page: number) => void;
}

export const CharacterListWrapper: React.FC<CharacterListWrapperProps> = ({
  cacheKey,
  size,
  page: initialPage,
  onPageChange,
  additionalParams,
}) => {
  // If there is no onPageChange, component manage page state itself
  const shouldManagePageState = useMemo(() => Boolean(!onPageChange), [onPageChange]);

  const [page, setPage] = useState(initialPage || 1);
  useEffect(() => {
    if (initialPage && initialPage !== page) {
      setPage(initialPage);
    }
  }, [initialPage]);

  const { data } = useQuery(
    [cacheKey, additionalParams, page],
    async () => {
      const response = await searchCharacter({ page: page || 1, ...additionalParams });
      return response;
    },
    {
      onSuccess() {
        setPrerenderReady();
      },
    }
  );

  useEffect(() => {
    if (shouldManagePageState) {
      setPage(1);
    }
  }, [shouldManagePageState, additionalParams]);

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
        onPageChange?.(newPage);
        if (shouldManagePageState) {
          setPage(newPage);
        }
      }}
    />
  );

  return (
    <div className="mt-4">
      <p>
        Chats and messages count are updated <strong>every 30-60 minutes.</strong>
      </p>

      {pagination}

      <CharacterList size={size} characters={characters} />

      {pagination}
    </div>
  );
};
