import { UserConfigAndLocalData } from "../../../shared/services/user-config";
import { SupaChatMessage, ChatEntityWithCharacter } from "../../../types/backend-alias";
import { OpenAIInputMessage } from "./types/openai";

// Estimate token length only, should divide by 4.4 but left some as buffer
export const getTokenLength = (messages: OpenAIInputMessage[]) =>
  JSON.stringify(messages).length / 4;

export const chatToMessage = (chatMes: SupaChatMessage): OpenAIInputMessage => {
  return {
    role: chatMes.is_bot ? "assistant" : "user",
    content: chatMes.message,
  };
};

export const shouldUseTextStreaming = (config: UserConfigAndLocalData) => {
  if (config.open_ai_mode === "proxy") {
    return false;
  }

  return config.text_streaming;
};

export const buildSystemInstruction = (
  chat: ChatEntityWithCharacter,
  config: UserConfigAndLocalData,
  includeExampleDialog = false
) => {
  const { summary, characters } = chat;

  console.log({ chat });

  const { name = "", personality = "", scenario = "", example_dialogs = "" } = characters;

  const jailbreakPrompt = config.jailbreak_prompt;

  // Remove linebreak and tab to save token lol
  const promptWithCharInfo = `${jailbreakPrompt}.
  {{char}}'s name: ${name}. {{char}} calls {{user}} by {{user}} or any name introduced by {{user}}.
    ${personality ? `{{char}}'s personality: ${personality}.` : ""}
    ${scenario ? `Scenario of the roleplay: ${scenario}.` : ""}
    ${summary ? `Summary of what happened: ${summary}` : ""}`.replace(/[\n\t]/g, "");

  const systemInstruction = `${promptWithCharInfo}.${
    includeExampleDialog && example_dialogs
      ? `Example conversations between {{char}} and {{user}}: ${example_dialogs}.`
      : ""
  }`;

  return systemInstruction;
};

export const callOpenAI = async (
  messages: OpenAIInputMessage[],
  config: UserConfigAndLocalData
) => {
  const baseUrl =
    config.open_ai_mode === "api_key" ? "https://api.openai.com/v1" : config.open_ai_reverse_proxy;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    body: JSON.stringify({
      model: config.model,
      temperature: config.generation_settings.temperature,
      max_tokens: config.generation_settings.max_new_token || undefined,
      stream: shouldUseTextStreaming(config),
      messages,
    }),
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: config.open_ai_mode === "api_key" ? `Bearer ${config.openAIKey}` : "",
    },
  });

  return response;
};
