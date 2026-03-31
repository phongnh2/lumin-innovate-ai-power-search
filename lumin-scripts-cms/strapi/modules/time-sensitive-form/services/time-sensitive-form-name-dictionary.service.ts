import { Colors } from "@strapi/config/enum.ts";

export class TimeSensitiveFormNameDictionaryService {
  private synonymDictionary: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDictionary();
  }

  private initializeDictionary(): void {
    // this.synonymDictionary.set("annual report", [
    //   "annual report",
    //   "yearly report",
    //   "annual filing",
    //   "year end report",
    // ]);

    // this.synonymDictionary.set("quarterly report", [
    //   "quarterly report",
    //   "q1 report",
    //   "q2 report",
    //   "q3 report",
    //   "q4 report",
    //   "quarter report",
    // ]);

    console.log(
      `${Colors.Blue}📚 Initialized name dictionary with ${this.synonymDictionary.size} synonym groups${Colors.Reset}`,
    );
  }

  public getCanonicalName(formName: string): string {
    const normalizedInput = formName.trim().toLowerCase();

    for (const [canonical, synonyms] of this.synonymDictionary.entries()) {
      if (synonyms.some((synonym) => synonym.toLowerCase() === normalizedInput)) {
        return canonical;
      }
    }

    return formName.trim();
  }

  public areNamesEquivalent(name1: string, name2: string): boolean {
    const canonical1 = this.getCanonicalName(name1);
    const canonical2 = this.getCanonicalName(name2);
    return canonical1.toLowerCase() === canonical2.toLowerCase();
  }
}

export const timeSensitiveFormNameDictionaryService = new TimeSensitiveFormNameDictionaryService();
