import { profileService } from "../../features/Profile/services/profile-service";
import { Json } from "../../types/supabase";
import { GenerationSetting, OPEN_AI_DEFAULT_GENERATION_SETTINGS } from "./generation-setting";
import { UserLocalData } from "./user-local-data";

export interface UserConfig {
  api: "openai" | "kobold" | "ooba" | "mock"; // Mock appear local only
  open_ai_mode?: "api_key" | "proxy";
  open_ai_reverse_proxy: string;

  model?: "gpt-3.5-turbo" | "text-davinci-003" | "gpt-4"; // gpt-3.5-turbo, text-davinci-003, gpt-4

  api_url?: string;
  generation_settings: GenerationSetting;

  immersive_mode: boolean;
  text_streaming: boolean;
}

export type UserConfigAndLocalData = UserConfig & UserLocalData;

const defaultUserConfig: UserConfig = {
  api: "openai",
  open_ai_mode: "proxy",
  open_ai_reverse_proxy: "https://whocars123-oai-proxy.hf.space/proxy/openai",
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
