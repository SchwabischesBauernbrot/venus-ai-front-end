import { countTokens } from "@syonfox/gpt-3-encoder";

export class Tokenizer {
  static count(str: string) {
    return countTokens(str || "");
  }

  static update(el) {
    if (el === undefined) {
      document.querySelectorAll("input[type=text], textarea").forEach((el) => {
        this.update(el);

        const total = countTokens(
          Edit.name +
            Edit.summary +
            Edit.personality +
            Edit.scenario +
            Edit.greeting +
            Edit.examples
        );

        // document.getElementById(
        //   "edit-tokens"
        // ).innerText = `${total.toLocaleString()} total ${Format.pluralize(
        //   total,
        //   "token",
        //   "tokens"
        // )}`;
      });

      return;
    }

    const str = el.value.trim();
    const tokens = countTokens(str);

    // TODO: Improve
    // let nextSibling = el.nextSibling;
    // while (nextSibling && nextSibling.nodeType != 1) {
    //   nextSibling = nextSibling.nextSibling;
    // }

    // nextSibling.innerText = `${str.length.toLocaleString()} ${Format.pluralize(
    //   str.length,
    //   "character",
    //   "characters"
    // )}, ${tokens.toLocaleString()} ${Format.pluralize(
    //   tokens,
    //   "token",
    //   "tokens"
    // )}`;

    const total = countTokens(
      Edit.name +
        Edit.summary +
        Edit.personality +
        Edit.scenario +
        Edit.greeting +
        Edit.examples
    );
    // document.getElementById(
    //   "edit-tokens"
    // ).innerText = `${total.toLocaleString()} total ${Format.pluralize(
    //   total,
    //   "token",
    //   "tokens"
    // )}`;
  }
}
