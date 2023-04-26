export interface GenerationSetting {
  temperature: number;
  max_new_token?: number; // undefined mean unlimited

  // Only use for other models
  context_length?: number;
  repetition_penalty?: number;
}

export const OPEN_AI_DEFAULT_GENERATION_SETTINGS: GenerationSetting = {
  temperature: 1,
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
