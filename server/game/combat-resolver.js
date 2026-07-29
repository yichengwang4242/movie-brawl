"use strict";

const { GameRuleError, otherSide, sideName } = require("./rules.js");

class CombatResolver {
  constructor(state, deathResolver) {
    this.state = state;
    this.deaths = deathResolver;
  }

  static canAttack(card, targetKind = "minion") {
    if (
      !card ||
      card.attacksRemaining <= 0 ||
      card.stunned ||
      card.currentAttack <= 0
    ) {
      return false;
    }
    return !(targetKind === "hero" && card.attackRestriction === "minions");
  }

  hasTaunt(player) {
    return player.board.some((card) => card.keywords.includes("taunt"));
  }

  canTargetMinion(defendingPlayer, target) {
    return !this.hasTaunt(defendingPlayer) || target.keywords.includes("taunt");
  }

  applyLifesteal(source, sourceSide, actualDamage) {
    if (actualDamage <= 0 || !source?.keywords?.includes("lifesteal")) return;
    const restored = this.state.healHero(sourceSide, actualDamage);
    if (restored > 0) {
      this.state.addLog(
        `${source.role} 为${sideName(sourceSide)}恢复 ${restored} 点生命。`,
        "heal",
      );
    }
  }

  damageMinion(target, amount, source, sourceSide, options = {}) {
    if (!target || amount <= 0) return 0;
    if (target.shield) {
      target.shield = false;
      this.state.addLog(`${target.role} 的护盾挡下了伤害。`, "shield");
      return 0;
    }

    const actualDamage = Math.min(amount, Math.max(0, target.currentHealth));
    target.currentHealth -= amount;
    this.applyLifesteal(source, sourceSide, actualDamage);
    if (
      actualDamage > 0 &&
      target.reflect > 0 &&
      source &&
      options.allowReflect !== false
    ) {
      const targetSide = this.state.sideOfCard(target);
      this.state.addLog(
        `${target.role} 反弹 ${target.reflect} 点伤害。`,
        "reflect",
      );
      if (source.sourceKind === "hero") {
        this.damageHero(sourceSide, target.reflect, target, targetSide);
      } else {
        this.damageMinion(
          source,
          target.reflect,
          target,
          targetSide,
          { allowReflect: false },
        );
      }
    }
    return actualDamage;
  }

  damageHero(targetSide, amount, source, sourceSide) {
    if (amount <= 0) return 0;
    const hero = this.state.player(targetSide);
    const actualDamage = Math.min(amount, Math.max(0, hero.health));
    hero.health -= amount;
    this.applyLifesteal(source, sourceSide, actualDamage);
    this.state.addLog(`${sideName(targetSide)}英雄受到 ${amount} 点伤害。`, "damage");
    this.state.checkGameOver();
    return actualDamage;
  }

  attack(side, attackerId, target) {
    const attackerPlayer = this.state.player(side);
    const defendingSide = otherSide(side);
    const defendingPlayer = this.state.player(defendingSide);
    const attacker = attackerPlayer.board.find(
      (card) => card.instanceId === attackerId,
    );
    if (!attacker) {
      throw new GameRuleError("ATTACKER_NOT_FOUND", "进攻角色已经不在场上。");
    }

    if (target === "hero") {
      this.attackHero(side, attacker, defendingSide, defendingPlayer);
      return;
    }

    const defender = defendingPlayer.board.find(
      (card) => card.instanceId === target,
    );
    if (!defender) {
      throw new GameRuleError("TARGET_NOT_FOUND", "防守角色已经不在场上。");
    }
    this.attackMinion(side, attacker, defendingSide, defendingPlayer, defender);
  }

  attackHero(side, attacker, defendingSide, defendingPlayer) {
    if (!CombatResolver.canAttack(attacker, "hero")) {
      const message =
        attacker.attackRestriction === "minions"
          ? "疾冲角色登场回合不能攻击英雄。"
          : "这个角色现在不能攻击。";
      throw new GameRuleError("CANNOT_ATTACK", message);
    }
    if (this.hasTaunt(defendingPlayer)) {
      throw new GameRuleError("TAUNT_BLOCKS", "必须先处理具有嘲讽的角色。");
    }

    attacker.attacksRemaining -= 1;
    this.state.addLog(
      `${attacker.role} 直接攻击${sideName(defendingSide)}英雄。`,
      "attack",
    );
    this.damageHero(defendingSide, attacker.currentAttack, attacker, side);
  }

  attackMinion(side, attacker, defendingSide, defendingPlayer, defender) {
    if (!CombatResolver.canAttack(attacker, "minion")) {
      throw new GameRuleError("CANNOT_ATTACK", "这个角色现在不能攻击。");
    }
    if (!this.canTargetMinion(defendingPlayer, defender)) {
      throw new GameRuleError("TAUNT_BLOCKS", "必须先处理具有嘲讽的角色。");
    }

    attacker.attacksRemaining -= 1;
    const attackerDamage = attacker.currentAttack;
    const defenderDamage = defender.currentAttack;
    this.state.addLog(`${attacker.role} 与 ${defender.role} 交战。`, "attack");
    this.damageMinion(defender, attackerDamage, attacker, side);
    this.damageMinion(attacker, defenderDamage, defender, defendingSide);
    this.deaths.resolve();
    this.state.checkGameOver();
  }

  canHeroAttack(side) {
    const player = this.state.player(side);
    return Boolean(
      player.weapon &&
      player.weapon.currentDurability > 0 &&
      player.heroAttacksRemaining > 0 &&
      player.weapon.currentAttack > 0,
    );
  }

  heroAttack(side, target) {
    const player = this.state.player(side);
    const defendingSide = otherSide(side);
    const defender = this.state.player(defendingSide);
    if (!this.canHeroAttack(side)) {
      throw new GameRuleError("HERO_CANNOT_ATTACK", "英雄现在不能使用武器攻击。");
    }

    const previousDefer = this.state.deferGameOver;
    if (target !== "hero") this.state.deferGameOver = true;
    try {
      if (target === "hero") {
        if (this.hasTaunt(defender)) {
          throw new GameRuleError("TAUNT_BLOCKS", "必须先处理具有嘲讽的角色。");
        }
        this.state.addLog(
          `${sideName(side)}使用 ${player.weapon.role} 攻击敌方英雄。`,
          "attack",
        );
        this.damageHero(
          defendingSide,
          player.weapon.currentAttack,
          player.weapon,
          side,
        );
      } else {
        const targetCard = defender.board.find(
          (card) => card.instanceId === target,
        );
        if (!targetCard) {
          throw new GameRuleError("TARGET_NOT_FOUND", "防守角色已经不在场上。");
        }
        if (!this.canTargetMinion(defender, targetCard)) {
          throw new GameRuleError("TAUNT_BLOCKS", "必须先处理具有嘲讽的角色。");
        }
        const heroSource = {
          ...player.weapon,
          sourceKind: "hero",
          role: `${sideName(side)}英雄`,
        };
        this.state.addLog(
          `${sideName(side)}使用 ${player.weapon.role} 攻击 ${targetCard.role}。`,
          "attack",
        );
        this.damageMinion(
          targetCard,
          player.weapon.currentAttack,
          heroSource,
          side,
        );
        this.damageHero(side, targetCard.currentAttack, targetCard, defendingSide);
      }

      player.heroAttacksRemaining = 0;
      player.heroAttackUsedThisTurn = true;
      player.weapon.currentDurability -= 1;
      if (player.weapon.currentDurability <= 0) {
        this.state.addLog(`${player.weapon.role} 耐久耗尽。`, "weapon");
        player.weapon = null;
      }
      this.deaths.resolve();
    } finally {
      this.state.deferGameOver = previousDefer;
    }
    this.state.checkGameOver();
  }
}

module.exports = { CombatResolver };
