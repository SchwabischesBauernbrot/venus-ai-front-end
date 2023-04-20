import { CharacterJsonObject } from "./character";
import { JsonParseError, PngInvalidCharacterError } from "./error";
import { Png } from "./png";

export class Loader {
  // Create image element and wait for it to load
  static image(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.crossOrigin = "anonymous";
      image.src = src;
    });
  }

  // Parse JSON and wrap any error
  static #json(text: string) {
    try {
      return JSON.parse(text) as CharacterJsonObject;
    } catch (ex) {
      throw new JsonParseError("Unable to parse", text, {
        cause: ex,
      });
    }
  }

  static async parse(file: File) {
    let json = null;
    let image = null;

    if (file.type === "application/json") {
      json = this.#json(await file.text());
    } else if (file.type === "image/png") {
      const text = Png.Parse(await file.arrayBuffer());

      try {
        json = this.#json(text);
      } catch (ex) {
        if (!(ex instanceof JsonParseError)) throw ex;

        throw new PngInvalidCharacterError(
          'Unable to parse "chara" field as JSON',
          {
            cause: ex,
          }
        );
      }

      image = await this.image(URL.createObjectURL(file));
    }

    return {
      json,
      image,
    };
  }
}
