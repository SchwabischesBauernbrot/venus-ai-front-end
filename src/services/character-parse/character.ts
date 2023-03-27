import { Tokenizer } from "./tokenizer";

type JsonObject = { [key: string]: string };
export type CharacterJsonObject = JsonObject;

export class Character {
  #name: string;
  #summary: string;
  #personality: string;
  #scenario: string;
  #greeting: string;
  #examples: string;

  get name() {
    return this.#name;
  }

  get summary() {
    return this.#summary;
  }

  get personality() {
    return this.#personality;
  }

  get scenario() {
    return this.#scenario;
  }

  get greeting() {
    return this.#greeting;
  }

  get examples() {
    return this.#examples;
  }

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

  #valid(object: JsonObject, key: string) {
    if (
      !object ||
      !object.hasOwnProperty(key) ||
      !object[key] ||
      !object[key].trim()
    )
      return false;

    return true;
  }

  #sanitize(object: JsonObject, key: string) {
    return this.#valid(object, key) ? object[key].trim() : "";
  }

  constructor(json: JsonObject | null) {
    if (!json) return;

    // Text Generation
    if (this.#valid(json, "char_name"))
      this.#name = this.#sanitize(json, "char_name");
    if (this.#valid(json, "char_persona"))
      this.#personality = this.#sanitize(json, "char_persona");
    if (this.#valid(json, "world_scenario"))
      this.#scenario = this.#sanitize(json, "world_scenario");
    if (this.#valid(json, "char_greeting"))
      this.#greeting = this.#sanitize(json, "char_greeting");
    if (this.#valid(json, "example_dialogue"))
      this.#examples = this.#sanitize(json, "example_dialogue");

    // TavernAI
    if (this.#valid(json, "name")) this.#name = this.#sanitize(json, "name");
    if (this.#valid(json, "personality"))
      this.#summary = this.#sanitize(json, "personality");
    if (this.#valid(json, "description"))
      this.#personality = this.#sanitize(json, "description");
    if (this.#valid(json, "scenario"))
      this.#scenario = this.#sanitize(json, "scenario");
    if (this.#valid(json, "first_mes"))
      this.#greeting = this.#sanitize(json, "first_mes");
    if (this.#valid(json, "mes_example"))
      this.#examples = this.#sanitize(json, "mes_example");
  }
}
