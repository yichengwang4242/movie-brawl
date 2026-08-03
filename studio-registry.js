(function (root, factory) {
  const registry = factory();
  if (typeof module === "object" && module.exports) {
    registry.loadNode(require);
    module.exports = registry;
  }
  if (root) root.MOVIE_BRAWL_STUDIO_REGISTRY = registry;
})(typeof window !== "undefined" ? window : null, function () {
  const descriptors = [
    {
      id: "shaw",
      cardModule: "./shaw-cards.js",
      adventureModule: "./shaw-adventure.js",
      cardGlobal: "MOVIE_BRAWL_SHAW_CARDS",
      adventureGlobal: "MOVIE_BRAWL_SHAW_ADVENTURE",
      encounterModule: "./server/adventure/shaw-encounter-rules.js",
      encounterExport: "ShawEncounterRules",
      artFile: "assets/shaw-studio-stage.png",
    },
    {
      id: "golden-harvest",
      cardModule: "./golden-harvest-cards.js",
      adventureModule: "./golden-harvest-adventure.js",
      cardGlobal: "MOVIE_BRAWL_GOLDEN_HARVEST_CARDS",
      adventureGlobal: "MOVIE_BRAWL_GOLDEN_HARVEST_ADVENTURE",
      encounterModule: "./server/adventure/golden-harvest-encounter-rules.js",
      encounterExport: "GoldenHarvestEncounterRules",
      artFile: "assets/golden-harvest-stage.png",
    },
    {
      id: "cinema-city",
      cardModule: "./cinema-city-cards.js",
      adventureModule: "./cinema-city-adventure.js",
      cardGlobal: "MOVIE_BRAWL_CINEMA_CITY_CARDS",
      adventureGlobal: "MOVIE_BRAWL_CINEMA_CITY_ADVENTURE",
      encounterModule: "./server/adventure/cinema-city-encounter-rules.js",
      encounterExport: "CinemaCityEncounterRules",
      effectModule: "./server/game/cinema-city-effect-handlers.js",
      effectExport: "CinemaCityEffectHandlers",
      artFile: "assets/cinema-city-stage.png",
    },
    {
      id: "d-and-b",
      cardModule: "./d-and-b-cards.js",
      adventureModule: "./d-and-b-adventure.js",
      cardGlobal: "MOVIE_BRAWL_D_AND_B_CARDS",
      adventureGlobal: "MOVIE_BRAWL_D_AND_B_ADVENTURE",
      encounterModule: "./server/adventure/d-and-b-encounter-rules.js",
      encounterExport: "DandBEncounterRules",
      effectModule: "./server/game/d-and-b-effect-handlers.js",
      effectExport: "DandBEffectHandlers",
      artFile: "assets/d-and-b-stage.png",
    },
    {
      id: "golden-princess",
      cardModule: "./golden-princess-cards.js",
      adventureModule: "./golden-princess-adventure.js",
      cardGlobal: "MOVIE_BRAWL_GOLDEN_PRINCESS_CARDS",
      adventureGlobal: "MOVIE_BRAWL_GOLDEN_PRINCESS_ADVENTURE",
      encounterModule: "./server/adventure/golden-princess-encounter-rules.js",
      encounterExport: "GoldenPrincessEncounterRules",
      effectModule: "./server/game/golden-princess-effect-handlers.js",
      effectExport: "GoldenPrincessEffectHandlers",
      artFile: "assets/golden-princess-stage.png",
    },
    {
      id: "milkyway-image",
      cardModule: "./milkyway-image-cards.js",
      adventureModule: "./milkyway-image-adventure.js",
      cardGlobal: "MOVIE_BRAWL_MILKYWAY_IMAGE_CARDS",
      adventureGlobal: "MOVIE_BRAWL_MILKYWAY_IMAGE_ADVENTURE",
      encounterModule: "./server/adventure/milkyway-image-encounter-rules.js",
      encounterExport: "MilkywayImageEncounterRules",
      effectModule: "./server/game/milkyway-image-effect-handlers.js",
      effectExport: "MilkywayImageEffectHandlers",
      artFile: "assets/milkyway-image-stage.png",
    },
  ];

  class StudioRegistry {
    constructor(entries) {
      this.descriptors = entries;
      this.cardSets = [];
      this.adventures = [];
      this.encounterRuleClasses = [];
      this.effectHandlerClasses = [];
      this.loaded = false;
    }

    loadNode(loader) {
      if (this.loaded) return this;
      this.cardSets = this.descriptors.map((entry) => loader(entry.cardModule));
      this.adventures = this.descriptors.map((entry) =>
        loader(entry.adventureModule),
      );
      this.encounterRuleClasses = this.descriptors.map((entry) =>
        loader(entry.encounterModule)[entry.encounterExport],
      );
      this.effectHandlerClasses = this.descriptors
        .filter((entry) => entry.effectModule)
        .map((entry) => loader(entry.effectModule)[entry.effectExport]);
      this.validate();
      this.loaded = true;
      return this;
    }

    async loadBrowser(browserRoot = window) {
      if (this.loaded) return this;
      for (const entry of this.descriptors) {
        await this.loadScript(entry.cardModule);
        await this.loadScript(entry.adventureModule);
      }
      this.cardSets = this.descriptors.map((entry) => browserRoot[entry.cardGlobal]);
      this.adventures = this.descriptors.map(
        (entry) => browserRoot[entry.adventureGlobal],
      );
      this.validate();
      await this.loadScript("./game-data.js");
      this.loaded = true;
      return this;
    }

    loadScript(source) {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = source;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load ${source}`));
        document.head.append(script);
      });
    }

    validate() {
      const studioIds = this.adventures.map((adventure) => adventure?.id);
      if (
        studioIds.some((id) => !id) ||
        new Set(studioIds).size !== this.descriptors.length
      ) {
        throw new Error("Studio registry contains missing or duplicate IDs.");
      }
      this.descriptors.forEach((entry, index) => {
        if (this.adventures[index].id !== entry.id) {
          throw new Error(`Studio registry mismatch: ${entry.id}.`);
        }
        if (!this.cardSets[index]?.allCards?.length) {
          throw new Error(`Studio card set is empty: ${entry.id}.`);
        }
      });
    }

    get adventureCards() {
      return this.cardSets.flatMap((cards) => cards.allCards || []);
    }
  }

  return new StudioRegistry(descriptors);
});
