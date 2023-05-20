import { Character, CharacterJsonObject } from "./character";
import { JsonUnknownFormatError } from "./error";
import { Loader } from "./loader";

enum JsonFormat {
  TextGenerationCharacter = "Text Generation Character",
  TavernCharacter = "TavernAI Character",
  CaiCharacter = "CharacterAI Character",
  CaiHistory = "CharacterAI History",
  CharacterCard = "Character Card",
}

export class Source {
  file: File | null;
  json: CharacterJsonObject | null;
  image: HTMLImageElement | null;
  character: Character | undefined;
  format: JsonFormat | undefined;

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
      this.format = JsonFormat.TextGenerationCharacter;

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
      this.format = JsonFormat.TavernCharacter;

    if (
      json.character &&
      checkProperties(["name", "title", "description", "greeting", "definition"], json.character)
    )
      this.format = JsonFormat.CaiCharacter;

    if (
      json.info &&
      json.info.character &&
      checkProperties(["name", "title", "description", "greeting"], json.info.character)
    )
      this.format = JsonFormat.CaiHistory;
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

    this.character = Character.fromJsonObject(this.json);

    if (this.json) {
      this.#detectFormats(this.json);

      if (!this.format && Object.keys(this.json).length > 0)
        throw new JsonUnknownFormatError("Format not recognised", this.json);

      if (this.image) this.format = JsonFormat.CharacterCard;
    }
  }
}
