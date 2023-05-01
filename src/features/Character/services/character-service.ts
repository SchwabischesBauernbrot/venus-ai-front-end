import { axiosInstance } from "../../../config";
import { Paginated, CharacterView } from "../../../types/backend-alias";

export interface SearchCharactersParams {
  user_id?: string;
  tag_id?: number;

  page: number;
  only_nsfw?: boolean;
  sort?: string;
  search?: string;
}

export const searchCharacter = async (params: SearchCharactersParams) => {
  const result = await axiosInstance.get<Paginated<CharacterView>>("characters", {
    params,
  });

  return result.data;
};
