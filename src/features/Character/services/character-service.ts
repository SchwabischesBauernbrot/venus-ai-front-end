import { axiosInstance } from "../../../config";
import { Paginated, CharacterView } from "../../../types/backend-alias";
import { Character } from "./character-parse/character";
import { Author, Exporter } from "./character-parse/exporter";
import { Source } from "./character-parse/source";

export interface SearchCharactersParams {
  user_id?: string;
  tag_id?: number;

  page: number;
  mode?: "sfw" | "all" | "nsfw";
  sort?: "latest" | "popular";
  search?: string;
}

// Import/Export logic is referenced to https://github.com/ZoltanAI/character-editor
export const parseCharacter = async (file: File) => {
  const character = await Source.fromFile(file);
  return character;
};

export const exportCharacter = async (
  type: "json" | "card",
  imgSrc: string,
  character: Character,
  author: Author
) => {
  const tavernJson = Exporter.Tavern(character);

  if (type === "json") {
    return Exporter.Json(tavernJson, author);
  }

  return Exporter.Png(imgSrc, tavernJson, author);
};

export const searchCharacter = async (params: SearchCharactersParams) => {
  const result = await axiosInstance.get<Paginated<CharacterView>>("characters", {
    params,
  });

  return result.data;
};
