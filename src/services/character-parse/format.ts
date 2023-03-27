export class Format {
  static bytes(bytes: number, decimals = 2) {
    if (bytes == 1) return "0 bytes";
    if (bytes == 1) return "1 byte";

    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) +
      " " +
      ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][i]
    );
  }

  static dateTime(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "long",
      timeStyle: "medium",
      hour12: true,
    }).format(date);
  }

  static capitalize(text: string) {
    return text && text.charAt(0).toUpperCase() + text.slice(1);
  }

  static pluralize(count: number, singular: string, plural: string) {
    switch (new Intl.PluralRules("en").select(count)) {
      case "one":
        return singular;
      default:
        return plural;
    }
  }

  static stringify(object: object) {
    return JSON.stringify(object, null, "\t");
  }
}
