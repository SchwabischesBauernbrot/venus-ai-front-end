import { profileService } from "../pages/Profile/services/profile-service";
import { Json } from "../types/supabase";
import { GenerationSetting, OPEN_AI_DEFAULT_GENERATION_SETTINGS } from "./generation-setting";

export interface UserConfig {
  api: "openai" | "kobold" | "ooba";
  model?: "gpt-3.5-turbo" | "text-davinci-003" | "gpt-4"; // gpt-3.5-turbo, text-davinci-003, gpt-4
  api_key?: string;
  api_url?: string;
  generation_settings: GenerationSetting;

  immersive_mode: boolean;
  text_streaming: boolean;
}

const defaultUserConfig: UserConfig = {
  api: "openai",
  model: "gpt-3.5-turbo",
  generation_settings: OPEN_AI_DEFAULT_GENERATION_SETTINGS,
  text_streaming: true,
  immersive_mode: false,
};

export const getUserConfig = (config?: Json | Partial<UserConfig>) => {
  if (!config || typeof config !== "object") {
    return defaultUserConfig;
  }
  return { ...defaultUserConfig, ...config };
};

export const updateUserConfig = (config: Partial<UserConfig>) => {
  const newConfig = getUserConfig(config);
  profileService.updateProfile({ config: newConfig as any }); // This is an async call, just ignore it

  return newConfig;
};
