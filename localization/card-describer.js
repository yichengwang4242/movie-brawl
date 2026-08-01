(function (root, factory) {
  const CardDescriber = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = { CardDescriber };
  }
  if (root) root.MOVIE_BRAWL_CARD_DESCRIBER = { CardDescriber };
})(typeof window !== "undefined" ? window : null, function () {
  const FLAVOR_KEYS = new Map([
    ["没有技能，但随时准备入镜。", "effect.vanillaExtra"],
    ["没有技能，胜在基本功扎实。", "effect.vanillaDouble"],
    ["没有技能，攻守均衡。", "effect.vanillaInstructor"],
    ["仅限头目关卡。", "effect.bossOnly"],
    ["由两位友方角色融合而成。", "effect.fused"],
  ]);

  class CardDescriber {
    constructor(i18n) {
      this.i18n = i18n;
    }

    describe(card, definition = card) {
      const flavorKey = FLAVOR_KEYS.get(definition.text);
      if (flavorKey) return this.i18n.t(flavorKey);

      const parts = this.keywordText(definition);
      const effects = (definition.effects || []).map((effect) =>
        this.effectText(effect),
      );
      if (effects.length) {
        const key =
          definition.type === "role"
            ? "effect.onPlay"
            : definition.type === "weapon"
              ? "effect.onEquip"
              : null;
        const text = effects.join(" ");
        parts.push(key ? this.i18n.t(key, { text }) : text);
      }

      const deathEffects = (definition.deathEffects || []).map((effect) =>
        this.effectText(effect),
      );
      if (deathEffects.length) {
        parts.push(
          this.i18n.t("effect.deathrattle", {
            text: deathEffects.join(" "),
          }),
        );
      }

      if (
        definition.type === "weapon" &&
        /点攻击|Attack/i.test(definition.text || "") &&
        definition.durability
      ) {
        parts.push(
          this.i18n.t("effect.weaponStats", {
            attack: definition.attack,
            durability: definition.durability,
          }),
        );
      }

      return parts.join(" ") || this.i18n.t("effect.none");
    }

    keywordText(card) {
      const keywords = new Set(card.keywords || []);
      const parts = [];
      if (keywords.has("taunt")) parts.push(this.i18n.t("effect.taunt"));
      if (keywords.has("shield")) parts.push(this.i18n.t("effect.shield"));
      if (keywords.has("rush")) parts.push(this.i18n.t("effect.rush"));
      if (keywords.has("lifesteal")) {
        parts.push(this.i18n.t("effect.lifesteal"));
      }
      if (keywords.has("reflect") || card.reflect > 0) {
        parts.push(
          this.i18n.t("effect.reflect", { amount: card.reflect || 1 }),
        );
      }
      return parts;
    }

    effectText(effect) {
      const amount = effect.amount ?? 1;
      switch (effect.type) {
        case "draw":
          return this.i18n.t("effect.draw", { amount });
        case "healHero":
          return this.i18n.t("effect.healHero", { amount });
        case "damageEnemyHero":
          return this.i18n.t("effect.damageEnemyHero", { amount });
        case "damageRandomEnemy":
          return this.i18n.t("effect.damageRandomEnemy", { amount });
        case "damageAllEnemies":
          return this.i18n.t("effect.damageAllEnemies", { amount });
        case "damageWeakestEnemyMinion":
          return this.i18n.t("effect.damageWeakest", { amount });
        case "buffSelf":
          return this.buffText("effect.buffSelf", effect);
        case "buffRandomFriendly":
          return this.buffText("effect.buffRandom", effect);
        case "buffAllFriendly":
          return this.buffText("effect.buffAll", effect);
        case "weakenAllEnemies":
          return this.i18n.t("effect.weakenAll", { amount });
        case "weakenRandomEnemy":
          return this.i18n.t("effect.weakenRandom", { amount });
        case "gainTempMana":
          return this.i18n.t("effect.tempMana", { amount });
        case "summon":
          return this.summonText(effect);
        case "shieldAllFriendly":
          return this.i18n.t("effect.shieldAll");
        case "shieldRandomFriendly":
          return this.i18n.t("effect.shieldRandom");
        case "rushAllFriendly":
          return this.i18n.t("effect.rushAll");
        case "rushRandomFriendly":
          return this.i18n.t("effect.rushRandom");
        case "stunRandomEnemy":
          return this.i18n.t("effect.stun");
        case "addRandomNeutral":
          return this.i18n.t("effect.addNeutral");
        case "fuseFriendly":
          return this.i18n.t("effect.fuse", {
            role: this.i18n.entity(effect.role || "融合主角"),
          });
        case "grantReflectRandom":
          return this.i18n.t("effect.grantReflect", { amount });
        case "grantDeathEffectRandom":
          return this.i18n.t("effect.grantDeath");
        case "combo":
          return this.conditionalText("effect.combo", effect);
        case "whileArmed":
          return this.conditionalText("effect.whileArmed", effect);
        case "withPartner":
          return this.conditionalText("effect.withPartner", effect);
        case "comeback":
          return this.conditionalText("effect.comeback", effect);
        case "returnFriendlyToHand":
          return this.i18n.t("effect.returnFriendly", {
            amount: Math.abs(effect.costAdjustment || 0),
            direction: (effect.costAdjustment || 0) > 0
              ? this.i18n.t("effect.costIncrease")
              : this.i18n.t("effect.costReduction"),
          });
        case "soloSpotlight":
          return this.conditionalText("effect.soloSpotlight", effect);
        case "handover":
          return this.conditionalText("effect.handover", effect);
        case "twoTrack":
          return this.i18n.t("effect.twoTrack", {
            commercial: this.effectList(effect.commercialEffects),
            creative: this.effectList(effect.creativeEffects),
          });
        default:
          return this.i18n.locale === "en"
            ? `Effect: ${effect.type}.`
            : `技能效果：${effect.type}。`;
      }
    }

    buffText(key, effect) {
      const attack = effect.attack || 0;
      const health = effect.health || 0;
      if (attack && !health) {
        return this.i18n.t(`${key}Attack`, { amount: attack });
      }
      if (health && !attack) {
        return this.i18n.t(`${key}Health`, { amount: health });
      }
      return this.i18n.t(key, {
        attack,
        health,
      });
    }

    summonText(effect) {
      const token = effect.token || {};
      const amount = effect.amount || 1;
      const amountText =
        this.i18n.locale === "en"
          ? amount === 1
            ? "a "
            : `${amount} `
          : amount === 1
            ? "一个 "
            : `${amount} 个 `;
      return this.i18n.t("effect.summon", {
        amountText,
        stats: `${token.attack || 0}/${token.health || 0}`,
        role: this.i18n.entity(token.role || "群演"),
      });
    }

    conditionalText(key, effect) {
      const text = this.effectList(effect.effects);
      return this.i18n.t(key, { text });
    }

    effectList(effects = []) {
      return effects.map((nested) => this.effectText(nested)).join(" ");
    }
  }

  return CardDescriber;
});
