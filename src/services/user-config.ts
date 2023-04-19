import { Json } from "../types/supabase";
import { GenerationSetting, OPEN_AI_DEFAULT_GENERATION_SETTINGS } from "./generation-setting";

export interface UserConfig {
  api: "openai" | "kobold" | "ooba";
  model?: "gpt-3.5-turbo" | "text-davinci-003" | "gpt-4"; // gpt-3.5-turbo, text-davinci-003, gpt-4
  api_url?: string;
  generation_settings: GenerationSetting;
}

const defaultUserConfig: UserConfig = {
  api: "openai",
  model: "gpt-3.5-turbo",
  generation_settings: OPEN_AI_DEFAULT_GENERATION_SETTINGS,
};

export const getUserConfig = (config?: Json) => {
  if (!config || typeof config !== "object") {
    return defaultUserConfig;
  }
  return { ...defaultUserConfig, ...config };
};
