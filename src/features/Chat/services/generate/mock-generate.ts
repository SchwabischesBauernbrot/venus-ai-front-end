import delay from "delay";
import { GenerationSetting } from "../../../../shared/services/generation-setting";
import { ChatEntityWithCharacter, SupaChatMessage } from "../../../../types/backend-alias";
import { GenerateInterface, Prompt } from "./generate-interface";

export class MockGenerate extends GenerateInterface {
  async *generate({ text }: Prompt, generationSettings: GenerationSetting) {
    const finalResult = `${text} ${text} ${text} ${Math.random()}`;
    const words = finalResult.split(" ");
    for (const word of words) {
      await delay(50);
      yield word + " ";
    }
  }

  buildPrompt(chat: ChatEntityWithCharacter, chatHistory: SupaChatMessage[]) {
    const { summary, characters } = chat;
    const {
      personality = "",
      first_message = "",
      scenario = "",
      example_dialogs = "",
    } = characters;

    const basePrompt = `${personality}. ${first_message}. ${scenario}. ${example_dialogs}.
    Summary: ${summary}.
    ${chatHistory.map((chat) => chat.message).join("")}`;

    return { text: basePrompt };
  }
}

export const mockGenerateInstance: MockGenerate = new MockGenerate();
