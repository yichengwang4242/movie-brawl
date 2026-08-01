"use strict";

const studioRegistry = require("../../studio-registry.js");
const { GameRuleError } = require("../game/rules.js");

class EncounterRuleRegistry {
  constructor(encounter) {
    this.groups = studioRegistry.encounterRuleClasses.map(
      (RuleClass) => new RuleClass(encounter),
    );
    this.mechanics = new Set();
    for (const RuleClass of studioRegistry.encounterRuleClasses) {
      for (const mechanic of RuleClass.mechanics || []) {
        if (this.mechanics.has(mechanic)) {
          throw new Error(`Duplicate encounter mechanic: ${mechanic}`);
        }
        this.mechanics.add(mechanic);
      }
    }
  }

  handle(mechanic) {
    for (const group of this.groups) {
      if (group.handle(mechanic)) return;
    }
    throw new GameRuleError(
      "UNKNOWN_ENCOUNTER_MECHANIC",
      `尚未支持头目机制：${mechanic}`,
    );
  }

  static supportedMechanics() {
    return new Set(
      studioRegistry.encounterRuleClasses.flatMap(
        (RuleClass) => RuleClass.mechanics || [],
      ),
    );
  }
}

module.exports = { EncounterRuleRegistry };
