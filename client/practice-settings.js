// Remembers the AI difficulty the player picked for practice matches.
// Adventure stages show their own fixed difficulty in the same select, so the
// player's choice is kept here rather than read back from the select.
const STORAGE_KEY = "movie-brawl-practice-difficulty";
const DIFFICULTIES = new Set(["easy", "normal", "hard"]);

export class PracticeSettings {
  constructor(select, onChange = () => {}, storage = PracticeSettings.browserStorage()) {
    this.select = select;
    this.storage = storage;
    this.difficulty =
      this.normalize(this.read()) || this.normalize(select?.value) || "normal";
    if (!select) return;
    select.value = this.difficulty;
    select.addEventListener("change", () => {
      this.remember(select.value);
      onChange(this.difficulty);
    });
  }

  static browserStorage() {
    try {
      return typeof window !== "undefined" ? window.localStorage : null;
    } catch {
      return null;
    }
  }

  normalize(value) {
    return DIFFICULTIES.has(value) ? value : null;
  }

  read() {
    try {
      return this.storage?.getItem(STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  remember(value) {
    const difficulty = this.normalize(value);
    if (!difficulty) return this.difficulty;
    this.difficulty = difficulty;
    try {
      this.storage?.setItem(STORAGE_KEY, difficulty);
    } catch {
      // Storage can be unavailable in private windows; the choice still
      // applies for this session.
    }
    return difficulty;
  }
}
