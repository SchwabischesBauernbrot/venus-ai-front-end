import { Source } from "./character-parse/source";

export const parseCharacter = async (file: File) => {
  const character = await Source.fromFile(file);
  return character;
};
