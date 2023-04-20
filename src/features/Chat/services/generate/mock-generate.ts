import delay from "delay";
import {
  ChatEntityWithCharacter,
  ChatResponse,
  SupaChatMessage,
} from "../../../../types/backend-alias";

export async function* generate(prompt: string) {
  const finalResult = `${prompt} ${prompt} ${prompt} ${Math.random()}`;
  const words = finalResult.split(" ");
  for (const word of words) {
    await delay(50);
    yield word + " ";
  }
}

export async function buildPrompt(chat: ChatEntityWithCharacter, chatHistory: SupaChatMessage[]) {
  const { summary, characters } = chat;
  const { personality = "", first_message = "", scenario = "", example_dialogs = "" } = characters;

  const basePrompt = `${personality}. ${first_message}. ${scenario}. ${example_dialogs}.
  Summary: ${summary}.
  ${chatHistory.map((chat) => chat.message).join("")}`;

  console.log({ basePrompt });

  return basePrompt;
}
