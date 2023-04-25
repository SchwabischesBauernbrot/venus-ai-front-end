import { UserConfigAndLocalData } from "../../../../shared/services/user-config";
import { GenerateInterface, Prompt } from "./generate-interface";

class KoboldGenerate extends GenerateInterface {
  buildPrompt(
    message: string,
    chat: {
      id: number;
      character_id: string;
      user_id: string;
      summary: string;
      created_at: string;
      is_public: boolean;
      characters: {
        id?: string | undefined;
        name?: string | undefined;
        description?: string | undefined;
        avatar?: string | undefined;
        example_dialogs?: string | undefined;
        first_message?: string | undefined;
        personality?: string | undefined;
        scenario?: string | undefined;
      };
    },
    chatHistory: {
      chat_id: number;
      created_at: string;
      id: number;
      is_bot: boolean;
      is_main: boolean;
      message: string;
    }[],
    config: UserConfigAndLocalData
  ): Prompt {
    throw new Error("Method not implemented.");
  }
  async *generate(
    input: Prompt,
    config: UserConfigAndLocalData
  ): AsyncGenerator<string, void, void> {
    throw new Error("Method not implemented.");
  }
}

export const koboldGenerateInstance = new KoboldGenerate();
