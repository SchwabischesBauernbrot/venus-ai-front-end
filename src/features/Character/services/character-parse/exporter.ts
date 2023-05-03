import { Character } from "./character";
import { Loader } from "./loader";
import { Png } from "./png";

// Credit to: https://github.com/ZoltanAI/character-editor/blob/main/index.html#L1855
export class Exporter {
  static #metadata = {
    metadata: {
      version: 1,
      created: Date.now(),
      modified: Date.now(),
      source: null,
      tool: {
        name: "VenusAI",
        version: "1.0.0",
        url: "https://venusai.chat",
      },
    },
  };

  static #downloadFile(file: File) {
    const link = window.URL.createObjectURL(file);

    const a = document.createElement("a");
    a.setAttribute("download", file.name);
    a.setAttribute("href", link);
    a.click();
  }

  static Tavern(character: Character) {
    return {
      name: character.name || "",
      // Reversed on purpose lol, because that is how tavern work
      description: character.personality || "",
      personality: character.description || "",
      scenario: character.scenario || "",
      first_mes: character.first_message || "",
      mes_example: character.example_dialogs || "",
    };
  }

  static Json(data: { name: string }) {
    const object = {
      ...data,
      ...Exporter.#metadata,
    };

    const file = new File(
      [JSON.stringify(object, undefined, "\t")],
      (data.name || "character") + ".json",
      { type: "application/json;charset=utf-8" }
    );

    Exporter.#downloadFile(file);
  }

  static #convertToPng(image: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(image, 0, 0);
    }

    image.src = canvas.toDataURL("image/png");
    return image;
  }

  static async Png(imageSrc: string, data: { name: string }) {
    const object = {
      ...data,
      ...Exporter.#metadata,
    };

    const image = await Loader.image(imageSrc);
    const convertedImage = this.#convertToPng(image);

    const request = await fetch(convertedImage.src);
    const blob = await request.blob();

    const json = JSON.stringify(object, undefined, "\t");
    const png = Png.Generate(await blob.arrayBuffer(), json);
    const file = new File([png], (data.name || "character") + ".card.png", {
      type: "image/png",
    });

    Exporter.#downloadFile(file);
  }
}
