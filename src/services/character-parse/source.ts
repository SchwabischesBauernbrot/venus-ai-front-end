import { Character, CharacterJsonObject } from "./character";
import { JsonUnknownFormatError } from "./error";
import { Loader } from "./loader";

const JsonFormats = {
  TextGenerationCharacter: "Text Generation Character",
  TavernCharacter: "TavernAI Character",
  KoboldCharacter: "KoboldAI Character",
};

export class Source {
  file: File | null;
  json: CharacterJsonObject | null;
  image: HTMLImageElement | null;
  character: Character;
  formats: string[] = [];

  #detectFormats(json: CharacterJsonObject) {
    const checkProperties = (properties: string[], obj = json) =>
      properties.every((p) => obj.hasOwnProperty(p));

    if (
      checkProperties([
        "char_name",
        "char_persona",
        "world_scenario",
        "char_greeting",
        "example_dialogue",
      ])
    )
      this.formats.push(JsonFormats.TextGenerationCharacter);
    if (
      checkProperties([
        "name",
        "description",
        "personality",
        "scenario",
        "first_mes",
        "mes_example",
      ])
    )
      this.formats.push(JsonFormats.TavernCharacter);
  }

  static async fromFile(file: File) {
    const { json, image } = await Loader.parse(file);

    return new Source(file, json, image);
  }

  constructor(
    file: File | null = null,
    json: CharacterJsonObject | null = null,
    image: HTMLImageElement | null = null
  ) {
    if (file) this.file = file;
    if (json) this.json = json;
    if (image) this.image = image;

    this.character = new Character(this.json);

    if (this.json) {
      this.#detectFormats(this.json);

      if (this.formats.length < 1)
        throw new JsonUnknownFormatError("Format not recognised", this.json);

      if (this.image) this.formats = ["Character Card"];
    }
  }
}
