import { Tokenizer } from "./tokenizer";

interface CaiCharacterJson {
  name?: string;
  title?: string;
  description?: string;
  greeting?: string;
  definition?: string;
}

export interface CharacterJsonObject {
  // Text Generation UI
  char_name?: string;
  char_persona?: string;
  world_scenario?: string;
  char_greeting?: string;
  example_dialogue?: string;

  // Tavern UI
  name?: string;
  personality?: string;
  description?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;

  character?: CaiCharacterJson;
  info?: {
    character: CaiCharacterJson;
  };
}

type CharacterJsonObjKey = keyof CharacterJsonObject | keyof CaiCharacterJson;

export class Character {
  name: string;
  summary: string;
  personality: string;
  scenario: string;
  greeting: string;
  examples: string;

  get tokens() {
    return Tokenizer.count(
      this.name +
        this.summary +
        this.personality +
        this.scenario +
        this.greeting +
        this.examples
    );
  }

  #valid(object: CharacterJsonObject, key: CharacterJsonObjKey) {
    if (!object || !object.hasOwnProperty(key) || !object[key]) return false;

    return true;
  }

  #sanitize(object: CharacterJsonObject, key: CharacterJsonObjKey) {
    return this.#valid(object, key) ? (object[key] as string).trim() : "";
  }

  constructor(json: CharacterJsonObject | null) {
    if (!json) return;

    // Text Generation
    if (this.#valid(json, "char_name"))
      this.name = this.#sanitize(json, "char_name");
    if (this.#valid(json, "char_persona"))
      this.personality = this.#sanitize(json, "char_persona");
    if (this.#valid(json, "world_scenario"))
      this.scenario = this.#sanitize(json, "world_scenario");
    if (this.#valid(json, "char_greeting"))
      this.greeting = this.#sanitize(json, "char_greeting");
    if (this.#valid(json, "example_dialogue"))
      this.examples = this.#sanitize(json, "example_dialogue");

    // TavernAI
    if (this.#valid(json, "name")) this.name = this.#sanitize(json, "name");
    if (this.#valid(json, "personality"))
      this.summary = this.#sanitize(json, "personality");
    if (this.#valid(json, "description"))
      this.personality = this.#sanitize(json, "description");
    if (this.#valid(json, "scenario"))
      this.scenario = this.#sanitize(json, "scenario");
    if (this.#valid(json, "first_mes"))
      this.greeting = this.#sanitize(json, "first_mes");
    if (this.#valid(json, "mes_example"))
      this.examples = this.#sanitize(json, "mes_example");

    // CIA Character
    if (json.character) {
      if (this.#valid(json.character, "name"))
        this.name = this.#sanitize(json.character, "name");
      if (this.#valid(json.character, "title"))
        this.summary = this.#sanitize(json.character, "title");
      if (this.#valid(json.character, "description"))
        this.personality = this.#sanitize(json.character, "description");
      if (this.#valid(json.character, "greeting"))
        this.greeting = this.#sanitize(json.character, "greeting");
      if (this.#valid(json.character, "definition"))
        this.examples = this.#sanitize(json.character, "definition");
    }

    // CIA History
    if (json.info && json.info.character) {
      if (this.#valid(json.info.character, "name"))
        this.name = this.#sanitize(json.info.character, "name");
      if (this.#valid(json.info.character, "title"))
        this.summary = this.#sanitize(json.info.character, "title");
      if (this.#valid(json.info.character, "description"))
        this.personality = this.#sanitize(json.info.character, "description");
      if (this.#valid(json.info.character, "greeting"))
        this.greeting = this.#sanitize(json.info.character, "greeting");
      if (this.#valid(json.info.character, "definition"))
        this.examples = this.#sanitize(json.info.character, "definition");
    }
  }
}
