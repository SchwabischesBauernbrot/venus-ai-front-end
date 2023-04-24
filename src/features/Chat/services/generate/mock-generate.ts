import delay from "delay";
import { UserConfigAndLocalData } from "../../../../shared/services/user-config";
import { ChatEntityWithCharacter, SupaChatMessage } from "../../../../types/backend-alias";
import { GenerateInterface, Prompt } from "./generate-interface";

export class MockGenerate extends GenerateInterface {
  async *generate({ text }: Prompt, config: UserConfigAndLocalData) {
    const finalResult = `ID: ${Math.random()}. Prompt: ${text}!`;
    const words = finalResult.split(" ");
    for (const word of words) {
      await delay(50);
      yield word + " ";
    }
  }

  buildPrompt(
    message: string,
    chat: ChatEntityWithCharacter,
    chatHistory: SupaChatMessage[],
    config: UserConfigAndLocalData
  ) {
    const { summary, characters } = chat;
    const {
      personality = "",
      first_message = "",
      scenario = "",
      example_dialogs = "",
    } = characters;

    const basePrompt = `${personality}. ${first_message}. ${scenario}. ${example_dialogs}. Summary: ${summary}.
    ${chatHistory.map((chat) => chat.message).join("")}`;

    return { text: `Message: ${message}. ${basePrompt.substring(0, 300)}.` };
  }
}

export const mockGenerateInstance: MockGenerate = new MockGenerate();
