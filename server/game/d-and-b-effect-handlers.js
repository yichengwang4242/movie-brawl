"use strict";

const { otherSide, sideName } = require("./rules.js");

class DandBEffectHandlers {
  constructor(state, cardFactory, resolveNested) {
    this.state = state;
    this.cards = cardFactory;
    this.resolveNested = resolveNested;
  }

  registry() {
    return new Map([
      ["soloSpotlight", this.soloSpotlight.bind(this)],
      ["twoTrack", this.twoTrack.bind(this)],
      ["handover", this.handover.bind(this)],
    ]);
  }

  actor(context) {
    return context.self?.role || sideName(context.side);
  }

  soloSpotlight(effect, context) {
    const others = this.state
      .player(context.side)
      .board.filter((card) => card !== context.self);
    if (others.length) return;
    this.state.addLog(`${this.actor(context)}触发独角。`, "combo");
    this.resolveNested(effect.effects || [], context);
  }

  twoTrack(effect, context) {
    const ownerCount = this.state.player(context.side).board.length;
    const opponentCount = this.state.player(otherSide(context.side)).board.length;
    const commercial = ownerCount > opponentCount;
    const route = commercial ? "商业线" : "创作线";
    this.state.addLog(`${this.actor(context)}选择${route}。`, "combo");
    this.resolveNested(
      commercial
        ? effect.commercialEffects || []
        : effect.creativeEffects || [],
      context,
    );
  }

  handover(effect, context) {
    if (!this.state.player(context.side).charactersLostThisTurn) return;
    this.state.addLog(`${this.actor(context)}完成接班。`, "combo");
    this.resolveNested(effect.effects || [], context);
  }
}

module.exports = { DandBEffectHandlers };
