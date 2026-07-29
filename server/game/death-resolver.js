"use strict";

class DeathResolver {
  constructor(state) {
    this.state = state;
    this.effects = null;
    this.resolving = false;
  }

  setEffectResolver(effectResolver) {
    this.effects = effectResolver;
  }

  resolve() {
    if (this.resolving) return;
    this.resolving = true;
    const previousDefer = this.state.deferGameOver;
    this.state.deferGameOver = true;
    try {
      let fallen = this.state.takeDeadCards();
      while (fallen.length) {
        for (const { side, card } of fallen) {
          if (!card.deathEffects?.length) continue;
          this.state.addLog(`${card.role} 的亡语触发。`, "deathrattle");
          this.effects.resolve(
            card.deathEffects,
            { side, self: card, trigger: "deathrattle" },
            { deferDeaths: true },
          );
        }
        fallen = this.state.takeDeadCards();
      }
    } finally {
      this.resolving = false;
      this.state.deferGameOver = previousDefer;
    }
    this.state.checkGameOver();
  }
}

module.exports = { DeathResolver };
