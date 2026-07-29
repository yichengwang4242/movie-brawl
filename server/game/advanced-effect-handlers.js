"use strict";

class AdvancedEffectHandlers {
  constructor(state, cardFactory) {
    this.state = state;
    this.cards = cardFactory;
  }

  registry() {
    return new Map([
      ["fuseFriendly", this.fuseFriendly.bind(this)],
      ["grantReflectRandom", this.grantReflectRandom.bind(this)],
      ["grantDeathEffectRandom", this.grantDeathEffectRandom.bind(this)],
    ]);
  }

  fuseFriendly(effect, context) {
    const owner = this.state.player(context.side);
    const count = Math.max(2, effect.count || 2);
    if (owner.board.length < count) return;

    const ingredients = [...owner.board]
      .sort(
        (left, right) =>
          right.currentAttack +
          right.currentHealth -
          (left.currentAttack + left.currentHealth),
      )
      .slice(0, count);
    const ids = new Set(ingredients.map((card) => card.instanceId));
    owner.board = owner.board.filter((card) => !ids.has(card.instanceId));

    const inheritedKeywords = ingredients.flatMap((card) =>
      card.keywords.filter((keyword) =>
        ["taunt", "lifesteal", "shield", "rush", "reflect"].includes(keyword),
      ),
    );
    const deathEffects = ingredients.flatMap((card) => card.deathEffects || []);
    const keywords = [
      ...new Set([...(effect.keywords || []), ...inheritedKeywords]),
    ];
    if (deathEffects.length && !keywords.includes("deathrattle")) {
      keywords.push("deathrattle");
    }
    const attack =
      ingredients.reduce((total, card) => total + card.currentAttack, 0) +
      (effect.bonusAttack || 0);
    const health =
      ingredients.reduce((total, card) => total + card.currentHealth, 0) +
      (effect.bonusHealth || 0);
    const fused = this.cards.createToken({
      role: effect.role || "融合主角",
      attack,
      health,
      motif: effect.motif || "合",
      palette: effect.palette || "gold",
      keywords,
      deathEffects,
      reflect: Math.max(...ingredients.map((card) => card.reflect || 0), 0),
      text: "由两位友方角色融合而成。",
    });
    fused.summonedTurn = this.state.turn;
    fused.shield = ingredients.some((card) => card.shield);
    if (keywords.includes("rush")) {
      fused.attacksRemaining = 1;
      fused.attackRestriction = "minions";
    }
    owner.board.push(fused);
    this.state.addLog(
      `${ingredients.map((card) => card.role).join("与")}融合为 ${fused.role}。`,
      "fusion",
    );
  }

  grantReflectRandom(effect, context) {
    const target = this.cards.random.item(this.state.player(context.side).board);
    if (!target) return;
    target.reflect = Math.max(target.reflect || 0, effect.amount || 1);
    target.keywords = [...new Set([...target.keywords, "reflect"])];
    this.state.addLog(`${target.role} 获得反伤 ${target.reflect}。`, "buff");
  }

  grantDeathEffectRandom(effect, context) {
    const target = this.cards.random.item(this.state.player(context.side).board);
    if (!target || !effect.deathEffect) return;
    target.deathEffects = [
      ...(target.deathEffects || []),
      { ...effect.deathEffect },
    ];
    target.keywords = [...new Set([...target.keywords, "deathrattle"])];
    this.state.addLog(`${target.role} 获得新的亡语。`, "buff");
  }
}

module.exports = { AdvancedEffectHandlers };
