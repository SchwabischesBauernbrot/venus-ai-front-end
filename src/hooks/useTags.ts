import { useQuery } from "react-query";
import { axiosInstance, supabase } from "../config";
import { TagEntity } from "../types/backend-alias";

export const useTags = () => {
  const { data } = useQuery("tags", async () => await axiosInstance.get<TagEntity[]>("/tags"));
  const tags = data?.data;

  return tags;
};
