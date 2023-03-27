export class JsonParseError extends Error {
  #json;

  get json() {
    return this.#json;
  }

  constructor(message: string, json: string, options?: ErrorOptions) {
    super(message, options);

    this.name = "JSON Parse Error";
    this.#json = json;
  }
}

export class JsonUnknownFormatError extends Error {
  #json;

  get json() {
    return this.#json;
  }

  constructor(message: string, json: object, options?: ErrorOptions) {
    super(message, options);

    this.name = "Unknown JSON Format Error";
    this.#json = json;
  }
}

export class PngDecodeError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    this.name = "PNG Decode Error";
  }
}

export class PngFormatError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    this.name = "PNG Format Error";
  }
}

export class PngMissingCharacterError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    this.name = "PNG Missing Character Error";
  }
}

export class PngInvalidCharacterError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    this.name = "PNG Invalid Character Error";
  }
}
