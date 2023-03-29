import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase";
import axios from "axios";

export const SUPABASE_ENDPOINT = import.meta.env.VITE_SP_ENDPOINT as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SP_ANON_KEY as string;
export const SUPABASE_BUCKET_URL = import.meta.env.VITE_BUCKET_URL as string;
export const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT as string;

export const supabase = createClient<Database>(SUPABASE_ENDPOINT, SUPABASE_ANON_KEY);

export const axiosInstance = axios.create({
  baseURL: BACKEND_ENDPOINT,
});
