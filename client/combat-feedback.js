// Turns the difference between two server states into short-lived visual cues:
// floating damage/heal numbers, hit flashes, entrance animations, and fresh
// battle-log highlights. The server resolves a whole enemy turn in one
// response, so these cues are the only way the player sees what changed.
export const EFFECT_DURATION_MS = 1100;

const SIDES = ["player", "enemy"];

export class CombatFeedback {
  constructor(now = () => performance.now()) {
    this.now = now;
    this.gameId = null;
    this.version = null;
    this.snapshot = null;
    this.effects = null;
    this.logFloor = Infinity;
  }

  // The battle view re-renders on every selection and busy toggle, so only a
  // new state version creates new effects.
  observe(game) {
    const snapshot = CombatFeedback.capture(game);
    const sameGame = this.gameId === game.gameId;
    if (sameGame && this.version === game.version) return;
    if (sameGame && this.snapshot) {
      this.effects = {
        startedAt: this.now(),
        ...CombatFeedback.diff(this.snapshot, snapshot),
      };
      this.logFloor = this.snapshot.lastLogId;
    } else {
      this.effects = null;
      this.logFloor = snapshot.lastLogId;
    }
    this.gameId = game.gameId;
    this.version = game.version;
    this.snapshot = snapshot;
  }

  static capture(game) {
    const cards = new Map();
    for (const side of SIDES) {
      for (const card of game[side].board) {
        cards.set(card.instanceId, {
          health: card.currentHealth,
          shield: Boolean(card.shield),
        });
      }
    }
    return {
      heroes: { player: game.player.health, enemy: game.enemy.health },
      cards,
      lastLogId: game.logs.reduce((max, entry) => Math.max(max, entry.id), 0),
    };
  }

  static diff(before, after) {
    const cards = new Map();
    for (const [instanceId, current] of after.cards) {
      const previous = before.cards.get(instanceId);
      if (!previous) {
        cards.set(instanceId, { entering: true, delta: 0, shieldBroken: false });
        continue;
      }
      const delta = current.health - previous.health;
      const shieldBroken = previous.shield && !current.shield;
      if (delta || shieldBroken) {
        cards.set(instanceId, { entering: false, delta, shieldBroken });
      }
    }
    const heroes = {};
    for (const side of SIDES) {
      const delta = after.heroes[side] - before.heroes[side];
      if (delta) heroes[side] = delta;
    }
    return { cards, heroes };
  }

  isFreshLog(entry) {
    return entry.id > this.logFloor;
  }

  // Milliseconds since the latest effects began, or null once they are over.
  elapsed() {
    if (!this.effects) return null;
    const elapsed = this.now() - this.effects.startedAt;
    return elapsed < EFFECT_DURATION_MS ? elapsed : null;
  }

  // Board cards are rebuilt on every render, so effects are re-applied with a
  // negative animation delay that resumes them where they left off.
  decorateCard(node, instanceId) {
    const elapsed = this.elapsed();
    const effect = elapsed === null ? null : this.effects.cards.get(instanceId);
    if (!effect) return;
    node.style.setProperty("--fx-offset", `-${Math.round(elapsed)}ms`);
    if (effect.entering) node.classList.add("fx-enter");
    if (effect.delta < 0 || effect.shieldBroken) node.classList.add("fx-hit");
    if (effect.delta > 0) node.classList.add("fx-heal");
    if (effect.delta) node.appendChild(this.floatNumber(effect.delta));
  }

  // Hero panels persist between renders, so each change is shown only once.
  decorateHero(node, side) {
    const delta = this.elapsed() === null ? 0 : this.effects.heroes[side];
    if (!delta || node.dataset.fxVersion === String(this.version)) return;
    node.dataset.fxVersion = String(this.version);
    const className = delta < 0 ? "fx-hit" : "fx-heal";
    node.classList.remove("fx-hit", "fx-heal");
    void node.offsetWidth;
    node.classList.add(className);
    node.appendChild(this.floatNumber(delta));
    clearTimeout(node.fxTimer);
    node.fxTimer = setTimeout(
      () => node.classList.remove(className),
      EFFECT_DURATION_MS,
    );
  }

  floatNumber(delta) {
    const float = document.createElement("span");
    float.className = `fx-float ${delta < 0 ? "fx-float-damage" : "fx-float-heal"}`;
    float.setAttribute("aria-hidden", "true");
    float.textContent = delta > 0 ? `+${delta}` : String(delta);
    float.addEventListener("animationend", (event) => {
      if (event.target === float) float.remove();
    });
    return float;
  }
}
