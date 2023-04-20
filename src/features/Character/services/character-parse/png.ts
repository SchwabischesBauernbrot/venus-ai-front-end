import CRC32 from "crc-32";

import {
  PngDecodeError,
  PngFormatError,
  PngInvalidCharacterError,
  PngMissingCharacterError,
} from "./error";

interface Chunk {
  type: string;
  data: Uint8Array;
  crc: number;
}

export class Png {
  static #uint8 = new Uint8Array(4);
  static #int32 = new Int32Array(this.#uint8.buffer);
  static #uint32 = new Uint32Array(this.#uint8.buffer);

  // Parse and extract PNG tEXt chunk
  static #decodeText(data: Uint8Array) {
    let naming = true;
    let keyword = "";
    let text = "";

    for (let index = 0; index < data.length; index++) {
      const code = data[index];

      if (naming) {
        if (code) {
          keyword += String.fromCharCode(code);
        } else {
          naming = false;
        }
      } else {
        if (code) {
          text += String.fromCharCode(code);
        } else {
          throw new PngDecodeError(
            "Invalid NULL character found in PNG tEXt chunk"
          );
        }
      }
    }

    return {
      keyword,
      text,
    };
  }

  // Read PNG format chunk
  static #readChunk(data: Uint8Array, idx: number) {
    // Read length field
    this.#uint8[3] = data[idx++];
    this.#uint8[2] = data[idx++];
    this.#uint8[1] = data[idx++];
    this.#uint8[0] = data[idx++];
    const length = this.#uint32[0];

    // Read chunk type field
    const chunkType =
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]);

    // Read chunk data field
    const chunkData = data.slice(idx, idx + length);
    idx += length;

    // Read CRC field
    this.#uint8[3] = data[idx++];
    this.#uint8[2] = data[idx++];
    this.#uint8[1] = data[idx++];
    this.#uint8[0] = data[idx++];
    const crc = this.#int32[0];

    // Compare stored CRC to actual
    if (crc !== CRC32.buf(chunkData, CRC32.str(chunkType)))
      throw new PngDecodeError(
        'CRC for "' +
          chunkType +
          '" header is invalid, file is likely corrupted'
      );

    return {
      type: chunkType,
      data: chunkData,
      crc,
    };
  }

  // Read PNG file and extract chunks
  static #readChunks(data: Uint8Array): Chunk[] {
    if (
      data[0] !== 0x89 ||
      data[1] !== 0x50 ||
      data[2] !== 0x4e ||
      data[3] !== 0x47 ||
      data[4] !== 0x0d ||
      data[5] !== 0x0a ||
      data[6] !== 0x1a ||
      data[7] !== 0x0a
    )
      throw new PngFormatError("Invalid PNG header");

    const chunks = [];

    let idx = 8; // Skip signature
    while (idx < data.length) {
      const chunk = Png.#readChunk(data, idx);

      if (!chunks.length && chunk.type !== "IHDR")
        throw new PngDecodeError("PNG missing IHDR header");

      chunks.push(chunk);
      idx += 4 + 4 + chunk.data.length + 4; // Skip length, chunk type, chunk data, CRC
    }

    if (chunks.length === 0)
      throw new PngDecodeError("PNG ended prematurely, no chunks");
    if (chunks[chunks.length - 1].type !== "IEND")
      throw new PngDecodeError("PNG ended prematurely, missing IEND header");

    return chunks;
  }

  // Parse PNG file and return decoded UTF8 "chara" base64 tEXt chunk value
  static Parse(arrayBuffer: ArrayBuffer) {
    const chunks = Png.#readChunks(new Uint8Array(arrayBuffer));

    const text = chunks
      .filter((c) => c.type === "tEXt")
      .map((c) => Png.#decodeText(c.data));
    if (text.length < 1)
      throw new PngMissingCharacterError("No PNG text fields found in file");

    const character = text.find((t) => t.keyword === "chara");
    if (character === undefined)
      throw new PngMissingCharacterError(
        'No PNG text field named "chara" found in file'
      );

    try {
      return new TextDecoder().decode(
        Uint8Array.from(atob(character.text), (c) => c.charCodeAt(0))
      );
    } catch (e) {
      throw new PngInvalidCharacterError(
        'Unable to parse "chara" field as base64',
        {
          cause: e,
        }
      );
    }
  }
}
