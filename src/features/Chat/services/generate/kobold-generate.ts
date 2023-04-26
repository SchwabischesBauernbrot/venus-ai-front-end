import { UserConfigAndLocalData } from "../../../../shared/services/user-config";
import { ChatEntityWithCharacter, SupaChatMessage } from "../../../../types/backend-alias";
import { Tokenizer } from "../../../Character/services/character-parse/tokenizer"; // Lol this is heavy, try to reduce size
import { GenerateInterface, Prompt } from "./generate-interface";

const format = (inputMessage: string, characterName = "") => {
  return inputMessage
    .replace(/{{user}}/gi, "You")
    .replace(/<user>/gi, "You")
    .replace(/{{bot}}/gi, characterName)
    .replace(/{{char}}/gi, characterName)
    .replace(/<bot>/gi, characterName);
};

const getTokenLength = (fullPrompt: string) => Tokenizer.count(JSON.stringify(fullPrompt));

const buildBasePrompt = (
  chat: ChatEntityWithCharacter,
  config: UserConfigAndLocalData,
  includeExampleDialog = false
) => {
  const { summary, characters } = chat;
  const { name = "", personality = "", scenario = "", example_dialogs = "" } = characters;

  if (config.use_pygmalion_format) {
    const normalizedExampleDialog = format(example_dialogs);

    const basePrompt = `${name}'s Persona: ${personality}.
  ${scenario ? `Scenario: ${scenario}.` : ""}
  ${summary ? `Story summary: ${summary}.` : ""}
  <START>
  [DIALOGUE HISTORY]
  ${includeExampleDialog && normalizedExampleDialog ? normalizedExampleDialog : ""}
  `;

    return basePrompt;
  }

  return "Hello";
};

class KoboldGenerate extends GenerateInterface {
  buildPrompt(
    message: string,
    chat: ChatEntityWithCharacter,
    chatHistory: SupaChatMessage[],
    config: UserConfigAndLocalData
  ): Prompt {
    const { characters } = chat;
    const { name = "" } = characters;

    const maxNewToken = config.generation_settings.max_new_token || 300;
    // Hack, otherwise the genrated message will be cut-off, lol
    const maxContentLength = (config.generation_settings.context_length || 2048) - maxNewToken;

    const chatCopy = chatHistory.map((message) => {
      return `${message.is_bot ? name : "You"}: ${message.message}`;
    });

    const promptEnd = `\nYou: ${message}\n${name}:`;

    let finalPrompt = buildBasePrompt(chat, config, true) + chatCopy.join("\n") + promptEnd;
    let promptTokenLength = getTokenLength(finalPrompt);

    console.log({ promptTokenLength, finalPrompt });

    if (promptTokenLength < maxContentLength) {
      return { text: finalPrompt };
    }

    // When the conversation get too long, remove example conversations
    const basePromptWithoutExample = buildBasePrompt(chat, config, true);
    finalPrompt = basePromptWithoutExample + chatCopy.join("\n") + promptEnd;
    promptTokenLength = getTokenLength(finalPrompt);

    while (promptTokenLength >= maxContentLength) {
      // Remove couple of chat until it fit max token
      chatCopy.shift();
      chatCopy.shift();

      finalPrompt = basePromptWithoutExample + chatCopy.join("\n") + promptEnd;
      promptTokenLength = getTokenLength(finalPrompt);
    }
    console.log({ promptTokenLength, finalPrompt });

    return { text: finalPrompt };
  }

  async *generate(
    input: Prompt,
    config: UserConfigAndLocalData
  ): AsyncGenerator<string, void, void> {
    // Make API call
    yield input.text || "";

    // Try first lol
    // throw new Error("Method not implemented.");
  }
}

export const koboldGenerateInstance = new KoboldGenerate();
