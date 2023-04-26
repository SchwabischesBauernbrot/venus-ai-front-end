import { UserConfigAndLocalData } from "../../../../shared/services/user-config";
import { ChatEntityWithCharacter, SupaChatMessage } from "../../../../types/backend-alias";
import { OpenAIError, OpenAIInputMessage, OpenAIProxyError, OpenAIResponse } from "../types/openai";
import { GenerateInterface, Prompt } from "./generate-interface";

// Estimate token length only, should divide by 4.4 but left some as buffer
const getTokenLength = (messages: OpenAIInputMessage[]) => JSON.stringify(messages).length / 4;

const chatToMessage = (chatMes: SupaChatMessage): OpenAIInputMessage => {
  return {
    role: chatMes.is_bot ? "assistant" : "user",
    content: chatMes.message,
  };
};

const shouldUseTextStreaming = (config: UserConfigAndLocalData) => {
  if (config.open_ai_mode === "proxy") {
    return false;
  }

  return config.text_streaming;
};

const buildSystemInstruction = (
  chat: ChatEntityWithCharacter,
  config: UserConfigAndLocalData,
  includeExampleDialog = false
) => {
  const { summary, characters } = chat;
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
      max_tokens: config.generation_settings.max_new_token,
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

// export const

class OpenAIGenerate extends GenerateInterface {
  buildPrompt(
    message: string,
    chat: ChatEntityWithCharacter,
    chatHistory: SupaChatMessage[],
    config: UserConfigAndLocalData
  ): Prompt {
    let chatCopy = chatHistory.filter((message) => message.is_main).map(chatToMessage);
    const maxNewToken = config.generation_settings.max_new_token || 300;
    // Hack, otherwise the genrated message will be cut-off, lol
    const maxContentLength = (config.generation_settings.context_length || 4095) - maxNewToken;

    const userMessage: OpenAIInputMessage = { role: "user", content: message };

    let messages: OpenAIInputMessage[] = [
      { role: "system", content: buildSystemInstruction(chat, config, true) },
      // No need to add first message here, front-end should submit it
      ...chatCopy,
      userMessage,
    ];

    let promptTokenLength = getTokenLength(messages);

    if (promptTokenLength < maxContentLength) {
      return { messages };
    }

    // When the conversation get too long, remove example conversations
    const systemInstructionWithoutExample = buildSystemInstruction(chat, config, false);
    messages = [
      { role: "system", content: systemInstructionWithoutExample },
      ...chatCopy,
      userMessage,
    ];
    promptTokenLength = getTokenLength(messages);

    while (promptTokenLength >= maxContentLength) {
      // Remove couple of chat until it fit max token
      chatCopy.shift();
      chatCopy.shift();

      messages = [
        { role: "system", content: systemInstructionWithoutExample },
        ...chatCopy,
        userMessage,
      ];
      promptTokenLength = getTokenLength(messages);
    }

    return { messages };
  }

  async *generate(
    input: Prompt,
    config: UserConfigAndLocalData
  ): AsyncGenerator<string, void, void> {
    const result = await callOpenAI(input.messages!, config);
    let stream = shouldUseTextStreaming(config);

    if (!stream) {
      const response = await result.json();
      if ("choices" in response) {
        const openAIResponse = response as OpenAIResponse;
        yield openAIResponse.choices[0].message.content;
      } else if ("error" in response) {
        const error = response as { error: OpenAIError | OpenAIProxyError };
        throw new Error(error.error.message);
      }
    } else {
      const openAIStream = result.body;
      if (openAIStream) {
        const reader = openAIStream.getReader();
        const decoder = new TextDecoder();

        const start = new Date().getTime();
        let continueLoop = true;
        while (continueLoop) {
          // Prevent blocking if call take more than 2 minutes
          if (new Date().getTime() - start > 120 * 1000) {
            continueLoop = false;
          }

          const chunk = await reader.read();
          if (chunk.done) {
            continueLoop = false;
          }

          // This values can contains 1 or 2 link lol
          const value = decoder.decode(chunk.value);

          const dataLines = value.split("\n").filter((line) => line.startsWith("data: "));

          for (const line of dataLines) {
            if (line === "data: [DONE]") {
              continueLoop = false;
            } else {
              const data = JSON.parse(line.substring(6)) as any; // Remove "data: "
              // the first and last messages are undefined, protect against that
              const text = data.choices[0]["delta"]["content"] || "";
              yield text;
            }
          }
        }
      }
    }
  }
}

export const openAiGenerateInstance = new OpenAIGenerate();
