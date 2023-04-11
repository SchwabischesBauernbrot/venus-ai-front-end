import { useQuery } from "react-query";
import { supabase } from "../config";

export const useTags = () => {
  const { data } = useQuery("tags", async () => await supabase.from("tags").select());
  const tags = data?.data;

  return tags;
};
