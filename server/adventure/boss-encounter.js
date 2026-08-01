"use strict";

const {
  EncounterRuleRegistry,
} = require("./encounter-rule-registry.js");

class BossEncounter {
  constructor(engine, stage) {
    this.engine = engine;
    this.stage = stage;
    this.triggered = new Set();
    this.rules = new EncounterRuleRegistry(this);
  }

  setup() {
    this.engine.state.addLog(
      `场地规则：${this.stage.mechanicTitle}。`,
      "encounter",
    );
  }

  beforeEnemyTurn() {
    this.rules.handle(this.stage.mechanic);
    this.engine.deaths.resolve();
  }

  beforePlayerTurn() {}

  summon(role, attack, health, motif, keywords = []) {
    this.engine.effects.resolve(
      [{
        type: "summon",
        amount: 1,
        token: { role, attack, health, motif, keywords },
      }],
      { side: "enemy", self: null },
    );
  }

  toPublicState() {
    return {
      stageId: this.stage.id,
      order: this.stage.order,
      movie: this.stage.movie,
      title: this.stage.title,
      bossName: this.stage.bossName,
      bossType: this.stage.bossType,
      mechanicTitle: this.stage.mechanicTitle,
      mechanicText: this.stage.mechanicText,
    };
  }
}

module.exports = { BossEncounter };
