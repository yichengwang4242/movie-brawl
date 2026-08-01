(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.MOVIE_BRAWL_CARD_BUILDERS = api;
})(typeof window !== "undefined" ? window : null, function () {
  function createCardBuilders(options = {}) {
    const build = (type, data) => {
      const defaults = {
        id: data.id || options.idFor(type, data),
        type,
        ...(options.star ? { star: options.star } : {}),
        ...(options.region ? { region: options.region } : {}),
        ...(options.rarity
          ? { rarity: data.rarity || options.rarity }
          : {}),
        ...(type === "role" ? {} : { attack: 0, health: 0 }),
        keywords: data.keywords || [],
        effects: data.effects || [],
        deathEffects: data.deathEffects || [],
        ...(options.flags || {}),
      };
      return { ...defaults, ...data };
    };

    return {
      role: (data) => build("role", data),
      spell: (data) => build("spell", data),
      weapon: (data) => build("weapon", data),
    };
  }

  function studioCardBuilders(options) {
    return createCardBuilders({
      star: options.region,
      region: options.region,
      rarity: "片场",
      flags: { adventure: options.id },
      idFor: (type, data) => `${options.id}-${type}-${data.role}`,
    });
  }

  return { createCardBuilders, studioCardBuilders };
});
