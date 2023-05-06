import { Profile } from "../../types/profile";
import { toSlug } from "./utils";

export const profileUrl = (id: string, name: string) => {
  return `/profiles/${id}_profile-of-${toSlug(name)}`;
};

export const characterUrl = (id: string, name: string) => {
  return `/characters/${id}_character-${toSlug(name)}`;
};
