import { countTokens } from "gptoken";
import { Buffer } from "buffer";

// @ts-ignore
window.Buffer = Buffer;

export class Tokenizer {
  static count(input: string) {
    return countTokens(input || "");
  }

  static tokenCountFormat(input?: string) {
    if (!input) return "0 token";
    return `${Tokenizer.count(input)} tokens`;
  }
}
