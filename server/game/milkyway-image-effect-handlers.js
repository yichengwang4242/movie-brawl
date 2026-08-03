"use strict";

const { otherSide, sideName } = require("./rules.js");

class MilkywayImageEffectHandlers {
  constructor(state, cardFactory, resolveNested) {
    this.state = state;
    this.cards = cardFactory;
    this.resolveNested = resolveNested;
  }

  registry() {
    return new Map([
      ["standoff", this.standoff.bind(this)],
      ["deadline", this.deadline.bind(this)],
    ]);
  }

  actor(context) {
    return context.self?.role || sideName(context.side);
  }

  standoff(effect, context) {
    const owner = this.state.player(context.side);
    const opponent = this.state.player(otherSide(context.side));
    if (owner.board.length !== opponent.board.length) return;
    this.state.addLog(`${this.actor(context)}进入对峙。`, "combo");
    this.resolveNested(effect.effects || [], context);
  }

  deadline(effect, context) {
    const threshold = effect.threshold ?? 1;
    if (this.state.player(context.side).mana > threshold) return;
    this.state.addLog(`${this.actor(context)}压线完成时限。`, "combo");
    this.resolveNested(effect.effects || [], context);
  }
}

module.exports = { MilkywayImageEffectHandlers };
