"use strict";

const { sideName } = require("./rules.js");

class GoldenPrincessEffectHandlers {
  constructor(state, cardFactory, resolveNested) {
    this.state = state;
    this.cards = cardFactory;
    this.resolveNested = resolveNested;
  }

  registry() {
    return new Map([
      ["premiere", this.premiere.bind(this)],
      ["doubleFeature", this.doubleFeature.bind(this)],
    ]);
  }

  actor(context) {
    return context.self?.role || sideName(context.side);
  }

  premiere(effect, context) {
    const types = this.state.player(context.side).cardTypesPlayedThisTurn;
    if (types.length !== 1) return;
    this.state.addLog(`${this.actor(context)}触发首映。`, "combo");
    this.resolveNested(effect.effects || [], context);
  }

  doubleFeature(effect, context) {
    const types = this.state.player(context.side).cardTypesPlayedThisTurn;
    if (types.length < 2 || types.at(-1) === types.at(-2)) return;
    this.state.addLog(`${this.actor(context)}接上连映。`, "combo");
    this.resolveNested(effect.effects || [], context);
  }
}

module.exports = { GoldenPrincessEffectHandlers };
