import { GenerationSetting } from "../../../../shared/services/generation-setting";
import { UserConfigAndLocalData } from "../../../../shared/services/user-config";
import { ChatEntityWithCharacter, SupaChatMessage } from "../../../../types/backend-alias";
import { OpenAIInputMessage } from "../types/openai";

// Most model need text, ChatGPT need array of messages
export type Prompt = { text?: string; messages?: OpenAIInputMessage[] };

export abstract class GenerateInterface {
  // Need to add generation setting too
  abstract buildPrompt(
    message: string,
    chat: ChatEntityWithCharacter,
    chatHistory: SupaChatMessage[],
    config: UserConfigAndLocalData
  ): Prompt;
  abstract generate(
    input: Prompt,
    config: UserConfigAndLocalData
  ): AsyncGenerator<string, void, void>;
}
