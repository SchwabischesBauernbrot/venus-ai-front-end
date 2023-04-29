export interface GenerationSetting {
  temperature: number;
  max_new_token: number; // undefined or 0 mean unlimited
  context_length?: number;

  // Only use for other models
  repetition_penalty?: number;
}

export const OPEN_AI_DEFAULT_GENERATION_SETTINGS: GenerationSetting = {
  temperature: 1,
  max_new_token: 0,
  context_length: 4096,
};

export const KOBOLD_AI_DEFAULT_GENERATION_SETTING: GenerationSetting = {
  temperature: 0.7,
  max_new_token: 200,
  context_length: 1500, // can increase
  repetition_penalty: 1.1,
};

export const OOBAGOOGA_AI_DEFAULT_GENERATION_SETTING: GenerationSetting = {
  temperature: 0.7,
  max_new_token: 300,
  context_length: 2048, // can increase
  repetition_penalty: 1.08,
};
