"use strict";

class GoldenHarvestEncounterRules {
  static mechanics = [
    "iceFactory",
    "paperAltar",
    "clockTower",
    "luckyStars",
    "mallStunt",
    "jungleRaid",
    "lionDance",
    "colosseumDuel",
  ];

  constructor(encounter) {
    this.encounter = encounter;
  }

  handle(mechanic) {
    if (!GoldenHarvestEncounterRules.mechanics.includes(mechanic)) return false;
    this[mechanic]();
    return true;
  }

  get engine() {
    return this.encounter.engine;
  }

  summon(role, attack, health, motif, keywords = []) {
    this.encounter.summon(role, attack, health, motif, keywords);
  }

  iceFactory() {
    if (!this.engine.players.enemy.board.length) {
      this.summon("冰厂打手", 2, 1, "冰");
    }
  }

  paperAltar() {
    if (this.engine.turn % 2 !== 0) return;
    this.summon("纸人", 1, 1, "纸");
    this.engine.state.addLog("纸扎法坛映出新的替身。", "encounter");
  }

  clockTower() {
    if (this.engine.turn % 3 !== 0) return;
    const board = [...this.engine.players.player.board];
    if (!board.length) {
      this.engine.combat.damageHero("player", 1, null, "enemy");
    } else {
      for (const target of board) {
        this.engine.combat.damageMinion(target, 1, null, "enemy");
      }
    }
    this.engine.state.addLog("钟楼敲响，追逐进入险段。", "encounter");
  }

  luckyStars() {
    if (this.engine.players.enemy.board.length < 3) {
      this.summon("福星拍档", 1, 1, "福");
    }
  }

  mallStunt() {
    const enemy = this.engine.players.enemy;
    if (enemy.health > 18 || this.encounter.triggered.has("mallStunt")) return;
    this.encounter.triggered.add("mallStunt");
    for (const card of enemy.board) card.currentAttack += 1;
    this.summon("重案警员", 2, 2, "警", ["rush"]);
    this.engine.state.addLog(
      "商场特技启动：敌方全体获得 +1 攻击。",
      "encounter",
    );
  }

  jungleRaid() {
    if (this.engine.turn % 2 !== 0) return;
    const target = [...this.engine.players.player.board].sort(
      (left, right) =>
        right.currentAttack - left.currentAttack ||
        left.currentHealth - right.currentHealth,
    )[0];
    if (target) {
      this.engine.combat.damageMinion(target, 1, null, "enemy");
    } else {
      this.summon("突击队员", 1, 1, "突", ["rush"]);
    }
    this.engine.state.addLog("丛林交叉火力发动。", "encounter");
  }

  lionDance() {
    if (this.engine.turn % 2 !== 0) return;
    const target = this.engine.cards.random.item(this.engine.players.enemy.board);
    if (!target) {
      this.summon("醒狮队员", 2, 1, "狮", ["rush"]);
      return;
    }
    target.currentAttack += 1;
    this.engine.state.addLog(`${target.role} 借醒狮抢青获得 +1 攻击。`, "encounter");
  }

  colosseumDuel() {
    const stance = (this.engine.turn - 1) % 3;
    if (stance === 0) {
      this.summon("罗马拳手", 2, 2, "拳", ["rush"]);
      return;
    }
    if (stance === 1) {
      const target = this.engine.cards.random.item(this.engine.players.enemy.board);
      if (target) {
        target.currentAttack += 1;
        this.engine.state.addLog(`${target.role} 进入截击架势。`, "encounter");
      }
      return;
    }
    for (const target of [...this.engine.players.player.board]) {
      this.engine.combat.damageMinion(target, 1, null, "enemy");
    }
    this.engine.state.addLog(
      "猛攻式：我方全体角色受到 1 点伤害。",
      "encounter",
    );
  }
}

module.exports = { GoldenHarvestEncounterRules };
