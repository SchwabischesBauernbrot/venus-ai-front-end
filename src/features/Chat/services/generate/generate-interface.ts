import { GenerationSetting } from "../../../../shared/services/generation-setting";
import { ChatEntityWithCharacter, SupaChatMessage } from "../../../../types/backend-alias";

// Most model need text, ChatGPT need array of messages
export type Prompt = { text?: string; message?: string[] };

export abstract class GenerateInterface {
  // Need to add generation setting too
  abstract buildPrompt(chat: ChatEntityWithCharacter, chatHistory: SupaChatMessage[]): Prompt;
  abstract generate(
    input: Prompt,
    generationSettings: GenerationSetting
  ): AsyncGenerator<string, void, void>;
}
