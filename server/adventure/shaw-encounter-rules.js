"use strict";

class ShawEncounterRules {
  static mechanics = [
    "innAmbush",
    "guillotineMark",
    "goldenSwallow",
    "venomFormation",
    "brokenBlade",
    "goldenArm",
    "whiteLotus",
    "thirtySixChambers",
  ];

  constructor(encounter) {
    this.encounter = encounter;
  }

  handle(mechanic) {
    if (!ShawEncounterRules.mechanics.includes(mechanic)) return false;
    this[mechanic]();
    return true;
  }

  get engine() {
    return this.encounter.engine;
  }

  summon(role, attack, health, motif, keywords = []) {
    this.encounter.summon(role, attack, health, motif, keywords);
  }

  innAmbush() {
    if (this.engine.players.enemy.board.length < 2) {
      this.summon("山寨喽啰", 1, 1, "寨");
    }
  }

  guillotineMark() {
    if (this.engine.turn % 2 !== 0) return;
    const target = [...this.engine.players.player.board].sort(
      (left, right) => left.currentHealth - right.currentHealth,
    )[0];
    if (target) {
      this.engine.combat.damageMinion(target, 1, null, "enemy");
    } else {
      this.engine.combat.damageHero("player", 1, null, "enemy");
    }
    this.engine.state.addLog("索命印记落下。", "encounter");
  }

  goldenSwallow() {
    if (this.engine.turn % 2 !== 0) return;
    const target = this.engine.cards.random.item(this.engine.players.enemy.board);
    if (target) {
      target.shield = true;
      this.engine.state.addLog(`${target.role} 获得燕影护身。`, "encounter");
    } else {
      this.summon("燕影", 2, 1, "燕", ["rush"]);
    }
  }

  venomFormation() {
    if (this.engine.turn % 2 !== 0) return;
    const target = this.engine.cards.random.item(this.engine.players.enemy.board);
    if (!target) {
      this.summon("毒门伏兵", 1, 2, "毒", ["reflect"]);
      return;
    }
    target.reflect = Math.max(target.reflect || 0, 1);
    target.keywords = [...new Set([...target.keywords, "reflect"])];
    this.engine.state.addLog(`${target.role} 进入五毒阵位。`, "encounter");
  }

  brokenBlade() {
    const enemy = this.engine.players.enemy;
    if (enemy.health > 18 || this.encounter.triggered.has("brokenBlade")) return;
    this.encounter.triggered.add("brokenBlade");
    const weapon = this.engine.cards.createInstance({
      id: "boss-weapon-broken-blade",
      type: "weapon",
      star: "头目",
      role: "断刃",
      movie: "独臂刀",
      cost: 0,
      attack: 4,
      health: 0,
      durability: 2,
      motif: "断",
      palette: "crimson",
      text: "仅限头目关卡。",
      keywords: [],
      effects: [],
      deathEffects: [],
    });
    this.engine.equipWeapon("enemy", weapon);
    this.engine.state.addLog("方刚进入断臂觉醒。", "encounter");
  }

  goldenArm() {
    if (this.engine.turn % 2 !== 0) return;
    const target = this.engine.cards.random.item(this.engine.players.enemy.board);
    if (!target) return;
    target.currentAttack += 1;
    this.engine.state.addLog(`${target.role} 通过金臂横练获得 +1 攻击。`, "encounter");
  }

  whiteLotus() {
    const enemy = this.engine.players.enemy;
    if (enemy.board.length) {
      const restored = this.engine.state.healHero("enemy", 1);
      if (restored) {
        this.engine.state.addLog(`白莲法坛恢复 ${restored} 点生命。`, "encounter");
      }
    } else {
      this.summon("白莲香众", 1, 2, "香");
    }
  }

  thirtySixChambers() {
    const chamber = (this.engine.turn - 1) % 3;
    if (chamber === 0) {
      this.summon("木人桩", 1, 3, "木", ["taunt"]);
      return;
    }
    if (chamber === 1) {
      for (const card of this.engine.players.enemy.board) {
        card.maxHealth += 1;
        card.currentHealth += 1;
      }
      this.engine.state.addLog("腕力房训练：敌方角色获得 +0/+1。", "encounter");
      return;
    }
    this.engine.state.drawCards("enemy", 1, this.engine.cards);
    this.engine.players.enemy.mana = Math.min(
      10,
      this.engine.players.enemy.mana + 1,
    );
    this.engine.state.addLog(
      "兵器房训练：头目抽牌并获得 1 点临时戏力。",
      "encounter",
    );
  }
}

module.exports = { ShawEncounterRules };
