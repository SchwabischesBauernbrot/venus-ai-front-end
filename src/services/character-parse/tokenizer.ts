import { countTokens } from "gptoken";
import { Buffer } from "buffer";

// @ts-ignore
window.Buffer = Buffer;

export class Tokenizer {
  static count(str: string) {
    return countTokens(str || "");
  }
}
