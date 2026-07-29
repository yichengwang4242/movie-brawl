"use strict";

const {
  roleCards,
  spellCards,
  weaponCards,
  neutralCards,
  starterCards,
  allCards,
} = require("../../game-data.js");
const { RandomSource } = require("./random-source.js");

class CardFactory {
  constructor(options = {}) {
    this.random = new RandomSource(options.seed);
    this.instanceCounter = 0;
  }

  createDeck(options = {}) {
    const cardById = new Map(allCards.map((card) => [card.id, card]));
    const copies = [
      ["starter-role-普通群演", 1],
      ["starter-role-巡街警员", 1],
      ["starter-role-酒馆伙计", 1],
      ["starter-spell-临时加戏", 1],
      ["starter-role-替身演员", 1],
      ["starter-role-喜剧搭档", 1],
      ["starter-role-镖局护卫", 1],
      ["starter-role-年轻捕快", 1],
      ["starter-weapon-基础长棍", 1],
      ["starter-role-武馆教头", 1],
      ["starter-role-客栈女侠", 1],
      ["starter-role-重案探员", 1],
      ["starter-spell-街坊助阵", 1],
      ["role-周星驰-唐伯虎", 1],
      ["role-李连杰-黄飞鸿", 1],
    ];
    const deck = copies.flatMap(([id, count]) =>
      Array.from({ length: count }, () => cardById.get(id)),
    );
    const bonusCards = options.bonusCards || [];
    for (const bonus of bonusCards.slice(0, 8)) {
      const replacement = deck
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => card.type === bonus.type)
        .sort(
          (left, right) =>
            Math.abs(left.card.cost - bonus.cost) -
              Math.abs(right.card.cost - bonus.cost) ||
            right.card.cost - left.card.cost,
        )[0]?.index;
      if (replacement >= 0) deck.splice(replacement, 1, bonus);
    }
    return this.ensureOpeningCurve(this.random.shuffle(deck));
  }

  ensureOpeningCurve(deck) {
    const remaining = [...deck];
    const opening = [];
    for (const cost of [1, 2, 3]) {
      const index = remaining.findIndex((card) => card.cost === cost);
      if (index >= 0) opening.push(...remaining.splice(index, 1));
    }
    return [...opening, ...remaining];
  }

  createInstance(base) {
    this.instanceCounter += 1;
    return {
      ...base,
      keywords: [...base.keywords],
      effects: base.effects.map((effect) => ({
        ...effect,
        ...(effect.token ? { token: { ...effect.token } } : {}),
      })),
      deathEffects: (base.deathEffects || []).map((effect) => ({
        ...effect,
        ...(effect.token ? { token: { ...effect.token } } : {}),
      })),
      requirements: base.requirements ? { ...base.requirements } : null,
      instanceId: `card-${this.instanceCounter}`,
      currentAttack: base.attack || 0,
      currentHealth: base.health || 0,
      maxHealth: base.health || 0,
      currentDurability: base.durability || 0,
      maxDurability: base.durability || 0,
      reflect: base.reflect || 0,
      attacksRemaining: 0,
      attackRestriction: null,
      summonedTurn: null,
      shield: base.keywords.includes("shield"),
      stunned: false,
      skipNextReady: false,
    };
  }

  createToken(token) {
    return this.createInstance({
      id: `token-${token.role}`,
      type: "role",
      star: "片场",
      movie: "临时登场",
      cost: 0,
      attack: token.attack,
      health: token.health,
      motif: token.motif || "影",
      palette: token.palette || "steel",
      text:
        token.text ||
        (token.keywords?.includes("taunt") ? "嘲讽。" : "临时角色。"),
      keywords: token.keywords || [],
      effects: [],
      deathEffects: token.deathEffects || [],
      reflect: token.reflect || 0,
      role: token.role,
    });
  }

  createRandomNeutral() {
    return this.createInstance(this.random.item(neutralCards));
  }
}

module.exports = { CardFactory };
