import { Profile } from "../../types/profile";
import { toSlug } from "./utils";

export const profileUrl = (id: string, name: string) => {
  return `/profiles/${id}_profile-of-${toSlug(name)}`;
};

export const characterUrl = (id: string, name: string) => {
  return `/characters/${id}_character-${toSlug(name)}`;
};

export const tagUrl = (id: number, slug: string) => {
  return `/tags/${id}_characters-with-tag-${slug}`;
};
