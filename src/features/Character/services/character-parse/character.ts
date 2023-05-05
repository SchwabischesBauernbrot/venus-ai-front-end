import { FullCharacterView } from "../../../../types/backend-alias";
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
  description: string;
  personality: string;
  scenario: string;
  first_message: string;
  example_dialogs: string;

  constructor(
    name: string,
    description: string,
    personality: string,
    scenario: string,
    first_message: string,
    example_dialogs: string
  ) {
    this.name = name;
    this.personality = personality;
    this.description = description;
    this.scenario = scenario;
    this.first_message = first_message;
    this.example_dialogs = example_dialogs;
  }

  get tokens() {
    return Tokenizer.count(
      this.name +
        this.description +
        this.personality +
        this.scenario +
        this.first_message +
        this.example_dialogs
    );
  }

  static valid(object: CharacterJsonObject, key: CharacterJsonObjKey) {
    if (!object || !object.hasOwnProperty(key)) return false;

    return true;
  }

  static sanitize(
    object: Partial<CharacterJsonObject & CaiCharacterJson>,
    key: CharacterJsonObjKey
  ) {
    return ((object[key] as string) || "").trim();
  }

  static fromCharacterView(character: FullCharacterView) {
    return new Character(
      character.name,
      // Swapped on purpose lol
      character.description,
      character.personality,
      character.scenario,
      character.first_message,
      character.example_dialogs
    );
  }

  static fromJsonObject(json: CharacterJsonObject | null) {
    if (!json) return;

    let name = "",
      personality = "",
      description = "",
      scenario = "",
      first_message = "",
      example_dialogs = "";

    // Text Generation
    if (this.valid(json, "char_name")) name = this.sanitize(json, "char_name");
    if (this.valid(json, "char_persona")) personality = this.sanitize(json, "char_persona");
    if (this.valid(json, "world_scenario")) scenario = this.sanitize(json, "world_scenario");
    if (this.valid(json, "char_greeting")) first_message = this.sanitize(json, "char_greeting");
    if (this.valid(json, "example_dialogue"))
      example_dialogs = this.sanitize(json, "example_dialogue");

    // TavernAI
    if (this.valid(json, "name")) name = this.sanitize(json, "name");
    // These two are swapped on purpose lol
    if (this.valid(json, "personality")) description = this.sanitize(json, "personality");
    if (this.valid(json, "description")) personality = this.sanitize(json, "description");
    if (this.valid(json, "scenario")) scenario = this.sanitize(json, "scenario");
    if (this.valid(json, "first_mes")) first_message = this.sanitize(json, "first_mes");
    if (this.valid(json, "mes_example")) example_dialogs = this.sanitize(json, "mes_example");

    // CIA Character
    if (json.character) {
      if (this.valid(json.character, "name")) name = this.sanitize(json.character, "name");
      if (this.valid(json.character, "title")) description = this.sanitize(json.character, "title");
      if (this.valid(json.character, "description"))
        personality = this.sanitize(json.character, "description");
      if (this.valid(json.character, "greeting"))
        first_message = this.sanitize(json.character, "greeting");
      if (this.valid(json.character, "definition"))
        example_dialogs = this.sanitize(json.character, "definition");
    }

    // CIA History
    if (json.info && json.info.character) {
      if (this.valid(json.info.character, "name"))
        name = this.sanitize(json.info.character, "name");
      if (this.valid(json.info.character, "title"))
        description = this.sanitize(json.info.character, "title");
      if (this.valid(json.info.character, "description"))
        personality = this.sanitize(json.info.character, "description");
      if (this.valid(json.info.character, "greeting"))
        first_message = this.sanitize(json.info.character, "greeting");
      if (this.valid(json.info.character, "definition"))
        example_dialogs = this.sanitize(json.info.character, "definition");
    }

    return new Character(name, description, personality, scenario, first_message, example_dialogs);
  }
}
