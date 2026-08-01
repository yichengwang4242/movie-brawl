"use strict";

class CinemaCityEncounterRules {
  static mechanics = [
    "strivingRoom",
    "yinYangMisdirect",
    "acePartners",
    "happyWish",
    "operaCrosscut",
    "undercoverSignal",
    "prisonRollCall",
    "heroicBrotherhood",
  ];

  constructor(encounter) {
    this.encounter = encounter;
  }

  handle(mechanic) {
    if (!CinemaCityEncounterRules.mechanics.includes(mechanic)) return false;
    this[mechanic]();
    return true;
  }

  get engine() {
    return this.encounter.engine;
  }

  summon(role, attack, health, motif, keywords = []) {
    this.encounter.summon(role, attack, health, motif, keywords);
  }

  strivingRoom() {
    if (this.engine.players.enemy.board.length < 2) {
      this.summon("奋斗房拍档", 1, 1, "斗");
    }
  }

  yinYangMisdirect() {
    if (this.engine.turn % 2 !== 0) return;
    const target = this.engine.cards.random.item(this.engine.players.player.board);
    if (target) {
      target.currentAttack = Math.max(0, target.currentAttack - 1);
      this.engine.state.addLog(`${target.role}陷入阴阳错位，失去 1 点攻击。`, "encounter");
      return;
    }
    const restored = this.engine.state.healHero("enemy", 1);
    if (restored) {
      this.engine.state.addLog(`还魂倩影恢复 ${restored} 点生命。`, "encounter");
    }
  }

  acePartners() {
    const board = this.engine.players.enemy.board;
    if (board.length < 2) {
      this.summon("高科技拍档", 2, 1, "拍");
      return;
    }
    const target = this.engine.cards.random.item(board);
    target.currentAttack += 1;
    target.maxHealth += 1;
    target.currentHealth += 1;
    this.engine.state.addLog(`${target.role}接上拍档配合，获得 +1/+1。`, "encounter");
  }

  happyWish() {
    const wish = (this.engine.turn - 1) % 3;
    if (wish === 0) {
      this.summon("开心同学", 1, 1, "笑");
      return;
    }
    if (wish === 1) {
      const target = this.engine.cards.random.item(this.engine.players.enemy.board);
      if (target) {
        target.shield = true;
        this.engine.state.addLog(`${target.role}实现护身愿望。`, "encounter");
      }
      return;
    }
    this.engine.state.drawCards("enemy", 1, this.engine.cards);
    this.engine.state.addLog("青春愿望补上一张牌。", "encounter");
  }

  operaCrosscut() {
    const board = this.engine.players.enemy.board;
    if (board.length < 3) {
      this.summon("戏班同伴", 1, 1, "戏");
      return;
    }
    for (const target of board) target.currentAttack += 1;
    this.engine.state.addLog("三线会师：敌方全体获得 +1 攻击。", "encounter");
  }

  undercoverSignal() {
    if (this.engine.turn % 2 !== 0) return;
    const targets = [...this.engine.players.player.board].sort(
      (left, right) =>
        right.currentAttack - left.currentAttack ||
        left.currentHealth - right.currentHealth,
    );
    if (targets[0]) {
      targets[0].currentAttack = Math.max(0, targets[0].currentAttack - 1);
      this.engine.state.addLog(`${targets[0].role}收到假暗号，失去 1 点攻击。`, "encounter");
      return;
    }
    this.engine.combat.damageHero("player", 1, null, "enemy");
    this.engine.state.addLog("卧底暗号直指我方英雄。", "encounter");
  }

  prisonRollCall() {
    if (this.engine.turn % 3 !== 0) return;
    const target = [...this.engine.players.player.board].sort(
      (left, right) =>
        left.currentHealth - right.currentHealth ||
        right.currentAttack - left.currentAttack,
    )[0];
    if (!target) return;
    const returned = this.engine.state.zones.returnBoardCardToHand(
      "player",
      target,
      1,
    );
    if (returned) {
      this.engine.state.addLog(`${target.role}被强制转仓，费用增加 1。`, "encounter");
    }
  }

  heroicBrotherhood() {
    const beat = (this.engine.turn - 1) % 3;
    if (beat === 0) {
      this.summon("义气拍档", 2, 1, "义", ["rush"]);
      return;
    }
    if (beat === 1) {
      this.engine.state.drawCards("enemy", 1, this.engine.cards);
      this.engine.players.enemy.mana = Math.min(
        10,
        this.engine.players.enemy.mana + 1,
      );
      this.engine.state.addLog("兄弟接应：头目抽牌并获得 1 点临时戏力。", "encounter");
      return;
    }
    for (const target of this.engine.players.enemy.board) {
      target.currentAttack += 1;
    }
    this.engine.state.addLog("英雄本色：敌方全体获得 +1 攻击。", "encounter");
  }
}

module.exports = { CinemaCityEncounterRules };
