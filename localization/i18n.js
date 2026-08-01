(function (root, factory) {
  const dependencies =
    typeof module === "object" && module.exports
      ? {
          entities: require("./entities.js"),
          movies: require("./movies.js"),
          adventures: require("./adventures.js"),
          messages: require("./messages.js"),
          CardDescriber: require("./card-describer.js").CardDescriber,
          LogTranslator: require("./log-translator.js").LogTranslator,
        }
      : {
          entities: root.MOVIE_BRAWL_ENTITIES_EN,
          movies: root.MOVIE_BRAWL_MOVIES_EN,
          adventures: root.MOVIE_BRAWL_ADVENTURES_EN,
          messages: root.MOVIE_BRAWL_MESSAGES,
          CardDescriber: root.MOVIE_BRAWL_CARD_DESCRIBER.CardDescriber,
          LogTranslator: root.MOVIE_BRAWL_LOG_TRANSLATOR.LogTranslator,
        };
  const api = factory(dependencies);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.MOVIE_BRAWL_I18N = api;
})(typeof window !== "undefined" ? window : null, function (dependencies) {
  const SUPPORTED_LOCALES = new Set(["zh-CN", "en"]);

  class I18n {
    constructor(cardPool, adventureData, options = {}) {
      this.cardPool = cardPool || { allCards: [] };
      this.adventureData = adventureData || { stages: [] };
      this.messages = dependencies.messages;
      this.definitions = new Map(
        this.cardPool.allCards.map((card) => [card.id, card]),
      );
      this.listeners = new Set();
      this.storage = options.storage || this.browserStorage();
      this.locale = this.normalizeLocale(
        options.locale || this.storage?.getItem("movie-brawl-locale"),
      );
      this.describer = new dependencies.CardDescriber(this);
      this.logTranslator = new dependencies.LogTranslator(this);
    }

    browserStorage() {
      try {
        return typeof window !== "undefined" ? window.localStorage : null;
      } catch {
        return null;
      }
    }

    normalizeLocale(locale) {
      if (SUPPORTED_LOCALES.has(locale)) return locale;
      return String(locale || "").toLowerCase().startsWith("en")
        ? "en"
        : "zh-CN";
    }

    setLocale(locale, options = {}) {
      const next = this.normalizeLocale(locale);
      const changed = next !== this.locale;
      this.locale = next;
      if (options.persist !== false) {
        this.storage?.setItem("movie-brawl-locale", next);
      }
      this.applyDocument();
      if (changed) {
        for (const listener of this.listeners) listener(next);
      }
    }

    onChange(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }

    bindSelect(select) {
      if (!select) return;
      select.value = this.locale;
      select.addEventListener("change", () => this.setLocale(select.value));
    }

    t(key, params = {}) {
      const catalog = this.messages[this.locale] || this.messages["zh-CN"];
      const fallback = this.messages["zh-CN"][key] || key;
      const template = catalog[key] || fallback;
      return String(template).replace(/\{(\w+)\}/g, (match, name) =>
        params[name] === undefined ? match : String(params[name]),
      );
    }

    entity(value) {
      if (this.locale !== "en" || !value) return value;
      return dependencies.entities[value] || value;
    }

    movie(value) {
      if (this.locale !== "en" || !value) return value;
      return dependencies.movies[value] || value;
    }

    rarity(value) {
      return this.t(`rarity.${value}`);
    }

    region(value) {
      return this.t(`region.${value}`);
    }

    formatMovie(value) {
      const title = this.movie(value);
      return this.locale === "en" ? `“${title}”` : `《${title}》`;
    }

    card(source) {
      if (!source) return source;
      const definition = this.definitions.get(source.id) || source;
      const role = this.entity(source.role);
      return {
        ...source,
        star: this.entity(source.star),
        region: source.region ? this.region(source.region) : source.region,
        rarity: source.rarity
          ? this.rarity(source.rarity)
          : this.t("card.classic"),
        role,
        movie: this.movie(source.movie),
        motif:
          this.locale === "en"
            ? (role?.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase() ||
              "M")
            : source.motif,
        text:
          this.locale === "en"
            ? this.describer.describe(source, definition)
            : source.text,
      };
    }

    stage(source) {
      if (!source || this.locale !== "en") return source;
      const stageId = source.id || source.stageId;
      const translation = dependencies.adventures.stages[stageId] || {};
      return {
        ...source,
        movie: this.movie(source.movie),
        title: translation.title || source.title,
        bossName: translation.bossName || this.entity(source.bossName),
        mechanicTitle: translation.mechanicTitle || source.mechanicTitle,
        mechanicText: translation.mechanicText || source.mechanicText,
        rewardCards: (source.rewardCards || []).map((card) => this.card(card)),
      };
    }

    adventure(source) {
      if (!source || this.locale !== "en") return source;
      const translation = dependencies.adventures[source.id] || {};
      return {
        ...source,
        name: translation.name || source.name,
        kicker: translation.kicker || source.kicker,
        subtitle: translation.subtitle || source.subtitle,
        description: translation.description || source.description,
      };
    }

    adventureValue(value) {
      if (this.locale !== "en") return value;
      for (const stage of this.adventureData.stages || []) {
        const translation = dependencies.adventures.stages[stage.id];
        for (const key of [
          "title",
          "bossName",
          "mechanicTitle",
          "mechanicText",
        ]) {
          if (stage[key] === value && translation?.[key]) {
            return translation[key];
          }
        }
      }
      return this.entity(this.movie(value));
    }

    error(error, params = {}) {
      const key = `error.${error?.code || "REQUEST_FAILED"}`;
      const translated = this.t(key, params);
      if (translated !== key) return translated;
      return this.locale === "en"
        ? this.t("error.REQUEST_FAILED")
        : error?.message || this.t("error.REQUEST_FAILED");
    }

    log(entry) {
      return this.logTranslator.translate(entry?.message || "");
    }

    applyDocument(root = document) {
      if (!root?.querySelectorAll) return;
      root.documentElement?.setAttribute("lang", this.locale);
      if (root.body) root.body.dataset.locale = this.locale;
      root.title = this.t("meta.title");
      const description = root.querySelector('meta[name="description"]');
      if (description) description.content = this.t("meta.description");

      root.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = this.t(element.dataset.i18n);
      });
      root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        element.placeholder = this.t(element.dataset.i18nPlaceholder);
      });
      root.querySelectorAll("[data-i18n-aria]").forEach((element) => {
        element.setAttribute("aria-label", this.t(element.dataset.i18nAria));
      });
      root.querySelectorAll("[data-i18n-title]").forEach((element) => {
        element.title = this.t(element.dataset.i18nTitle);
      });
    }
  }

  return { I18n, SUPPORTED_LOCALES };
});
