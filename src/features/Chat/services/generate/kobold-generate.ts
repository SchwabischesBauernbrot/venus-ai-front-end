import { UserConfigAndLocalData } from "../../../../shared/services/user-config";
import { ChatEntityWithCharacter, SupaChatMessage } from "../../../../types/backend-alias";
import { Profile } from "../../../../types/profile";
import { Tokenizer } from "../../../Character/services/character-parse/tokenizer"; // Lol this is heavy, try to reduce size
import { getValidKoboldUrlApi } from "../check-service";
import { KoboldError, KoboldResponse } from "../types/kobold";
import { GenerateInterface, Prompt } from "./generate-interface";

const format = (inputMessage: string, characterName = "", userName = "You") => {
  return inputMessage
    .replace(/{{user}}/gi, userName)
    .replace(/<user>/gi, userName)
    .replace(/{{bot}}/gi, characterName)
    .replace(/<bot>/gi, characterName)
    .replace(/{{char}}/gi, characterName);
};

const KOBOLD_AI_SETTINGS = {
  temp: 1,
  rep_pen: 1,
  rep_pen_range: 0,
  top_p: 1,
  top_a: 1,
  top_k: 0,
  typical: 1,
  tfs: 1,
  rep_pen_slope: 0.9,
  single_line: false,
  use_stop_sequence: true,
  sampler_order: [6, 0, 1, 2, 3, 4, 5],
};

const getTokenLength = (fullPrompt: string) => Tokenizer.count(JSON.stringify(fullPrompt));

class KoboldGenerate extends GenerateInterface {
  private profile: Profile | undefined;

  setProfile(profile: Profile) {
    this.profile = profile;
  }

  buildPrompt(
    message: string,
    chat: ChatEntityWithCharacter,
    chatHistory: SupaChatMessage[],
    config: UserConfigAndLocalData
  ): Prompt {
    const { characters } = chat;
    const { name = "" } = characters;

    const maxNewToken = config.generation_settings.max_new_token || 300;
    // Hack, otherwise the genrated message will be cut-off
    // Need to -60 to fix fat token lol
    const maxContentLength = (config.generation_settings.context_length || 2048) - maxNewToken - 60;

    const youAnchor = config.use_pygmalion_format ? "You" : this.profile?.name || "You";
    const chatCopy = chatHistory.map((message) => {
      return `${message.is_bot ? name : youAnchor}: ${message.message}`;
    });

    const promptEnd = `\n${youAnchor}: ${message}\n${name}:`;

    let finalPrompt =
      this.buildBasePrompt(chat, config, true) + format(chatCopy.join("\n")) + promptEnd;
    let promptTokenLength = getTokenLength(finalPrompt);

    console.log({ promptTokenLength, finalPrompt });

    if (promptTokenLength < maxContentLength) {
      return { text: finalPrompt };
    }

    // When the conversation get too long, remove example conversations
    const basePromptWithoutExample = this.buildBasePrompt(chat, config, false);
    finalPrompt = basePromptWithoutExample + format(chatCopy.join("\n")) + promptEnd;
    promptTokenLength = getTokenLength(finalPrompt);

    while (promptTokenLength >= maxContentLength) {
      // Remove couple of chat until it fit max token
      chatCopy.shift();
      chatCopy.shift();

      finalPrompt = basePromptWithoutExample + format(chatCopy.join("\n")) + promptEnd;
      promptTokenLength = getTokenLength(finalPrompt);
    }
    console.log({ promptTokenLength, finalPrompt });

    return { text: finalPrompt };
  }

  async *generate(
    input: Prompt,
    config: UserConfigAndLocalData
  ): AsyncGenerator<string, void, void> {
    const { generation_settings } = config;

    console.log("prompt", input.text, generation_settings);

    const generate_data = {
      prompt: input.text,
      sampler_order: KOBOLD_AI_SETTINGS.sampler_order,
      temperature: generation_settings.temperature,
      max_context_length: generation_settings.context_length,
      max_length: generation_settings.max_new_token,
      rep_pen: generation_settings.repetition_penalty || KOBOLD_AI_SETTINGS.rep_pen,
      rep_pen_range: KOBOLD_AI_SETTINGS.rep_pen_range,
      rep_pen_slope: KOBOLD_AI_SETTINGS.rep_pen_slope,
      tfs: KOBOLD_AI_SETTINGS.tfs,
      top_a: KOBOLD_AI_SETTINGS.top_a,
      top_k: KOBOLD_AI_SETTINGS.top_k,
      top_p: KOBOLD_AI_SETTINGS.top_p,
      typical: KOBOLD_AI_SETTINGS.typical,
      use_world_info: false,
      singleline: false,
      // Wait later until this is supported
      // stop_sequence: this.userName + ":",
    };

    const response = await fetch(`${getValidKoboldUrlApi(config.api_url || "")}/v1/generate`, {
      body: JSON.stringify(generate_data),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });
    const data = (await response.json()) as KoboldResponse | KoboldError;

    const stopToken = config.use_pygmalion_format ? "You:" : `${this.userName}:`;

    if ("detail" in data) {
      throw new Error(JSON.stringify(data.detail));
    }
    if ("results" in data) {
      const result = data.results[0].text;
      const index = result.indexOf(stopToken);
      if (index > -1) {
        const cutOffResult = result.substring(0, index);
        yield cutOffResult.trim();
      } else {
        yield result.trim();
      }
    }
  }

  private buildBasePrompt(
    chat: ChatEntityWithCharacter,
    config: UserConfigAndLocalData,
    includeExampleDialog = false
  ) {
    const { summary, characters } = chat;
    const { name = "", personality = "", scenario = "", example_dialogs = "" } = characters;

    if (config.use_pygmalion_format) {
      const normalizedExampleDialogs = format(example_dialogs, name);

      const basePrompt = `${name}'s Persona: ${personality}.
    ${scenario || summary ? `Scenario: ${scenario}.${summary}.` : ""}
<START>
[DIALOGUE HISTORY]
${includeExampleDialog && normalizedExampleDialogs ? normalizedExampleDialogs : ""}
<START>
`
        .replace("\t", "")
        .replace("    ", "");

      return basePrompt;
    } else {
      const normalizedExampleDialogs = format(example_dialogs, name, this.userName);

      let processedExampleDialogs = normalizedExampleDialogs
        .split(/<START>/gi)
        .slice(1)
        .map((block) => `This is how ${name} should talk\n${block.trim()}`);

      const basePrompt = `${name}'s personality: ${personality}.
    ${
      scenario || summary ? `Circumstances and context of the dialogue: ${scenario}${summary}.` : ""
    }
    ${
      includeExampleDialog && processedExampleDialogs.length > 0
        ? processedExampleDialogs.join("\n")
        : ""
    }
    Then the roleplay chat between ${name} and ${this.userName} begins.
    `
        .replace("\t", "")
        .replace("    ", "");

      return basePrompt;
    }
  }
}

export const koboldGenerateInstance = new KoboldGenerate();
