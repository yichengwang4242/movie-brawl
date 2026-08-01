"use strict";

const { RULES, sideName } = require("./rules.js");

class CinemaCityEffectHandlers {
  constructor(state, cardFactory, resolveNested) {
    this.state = state;
    this.cards = cardFactory;
    this.resolveNested = resolveNested;
  }

  registry() {
    return new Map([
      ["withPartner", this.withPartner.bind(this)],
      ["comeback", this.comeback.bind(this)],
      ["returnFriendlyToHand", this.returnFriendlyToHand.bind(this)],
    ]);
  }

  actor(context) {
    return context.self?.role || sideName(context.side);
  }

  withPartner(effect, context) {
    const partners = this.state
      .player(context.side)
      .board.filter((card) => card !== context.self);
    if (!partners.length) return;
    this.state.addLog(`${this.actor(context)}触发拍档。`, "combo");
    this.resolveNested(effect.effects || [], context);
  }

  comeback(effect, context) {
    const owner = this.state.player(context.side);
    const opponent = this.state.player(context.side === "player" ? "enemy" : "player");
    if (owner.health >= opponent.health) return;
    this.state.addLog(`${this.actor(context)}触发剧情反转。`, "combo");
    this.resolveNested(effect.effects || [], context);
  }

  returnFriendlyToHand(effect, context) {
    const owner = this.state.player(context.side);
    if (owner.hand.length >= RULES.handLimit) return;
    const candidates = owner.board.filter((card) => card !== context.self);
    const target = this.cards.random.item(candidates);
    if (!target) return;
    const adjustment = effect.costAdjustment || 0;
    if (!this.state.zones.returnBoardCardToHand(
      context.side,
      target,
      adjustment,
    )) {
      return;
    }
    const costText = adjustment < 0
      ? `，费用降低 ${Math.abs(adjustment)}`
      : adjustment > 0
        ? `，费用增加 ${adjustment}`
        : "";
    this.state.addLog(`${target.role}转场回到手牌${costText}。`, "combo");
  }
}

module.exports = { CinemaCityEffectHandlers };
