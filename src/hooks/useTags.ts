import { useQuery } from "react-query";
import { supabase } from "../config";

export const useTags = () => {
  const { data } = useQuery(
    "tags",
    async () => await supabase.from("tags").select().order("id", { ascending: true })
  );
  const tags = data?.data;

  return tags;
};
