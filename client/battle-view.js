export class BattleView {
  constructor(elements, cardRenderer, callbacks, i18n) {
    this.elements = elements;
    this.cards = cardRenderer;
    this.callbacks = callbacks;
    this.i18n = i18n;
  }

  render(game, uiState) {
    const elements = this.elements;
    const attacker =
      uiState.selectedAttackerId === "hero" && game.player.weapon
        ? {
            instanceId: "hero",
            role: game.player.weapon.role,
            attackRestriction: null,
          }
        : game.player.board.find(
            (card) => card.instanceId === uiState.selectedAttackerId,
          );
    const enemyHasTaunt = game.enemy.board.some((card) =>
      card.keywords.includes("taunt"),
    );
    const heroCanBeTargeted =
      Boolean(attacker) &&
      attacker.attackRestriction !== "minions" &&
      !enemyHasTaunt;

    elements.playerHealth.textContent = game.player.health;
    elements.enemyHealth.textContent = game.enemy.health;
    elements.enemyHeroName.textContent = this.i18n.entity(game.enemy.name);
    elements.playerHeroName.textContent = this.i18n.entity(game.player.name);
    elements.aiDifficulty.value = game.aiDifficulty;
    elements.aiDifficulty.disabled = Boolean(game.adventure);
    elements.playerDeck.textContent = game.player.deckCount;
    elements.enemyDeck.textContent = game.enemy.deckCount;
    elements.playerHandCount.textContent = game.player.handCount;
    elements.enemyHandCount.textContent = game.enemy.handCount;
    elements.playerManaValue.textContent =
      `${game.player.mana}/${game.player.maxMana}`;
    elements.enemyManaValue.textContent =
      `${game.enemy.mana}/${game.enemy.maxMana}`;
    elements.turnCount.textContent = game.turn;
    elements.inspectorTurn.textContent = game.turn;
    elements.turnLabel.textContent = this.turnLabel(game);
    elements.actionStatus.textContent = this.actionStatus(
      game,
      attacker,
      uiState,
    );

    elements.enemyHero.classList.toggle("targetable", heroCanBeTargeted);
    elements.enemyHero.classList.toggle("defeated", game.enemy.health <= 0);
    elements.playerHero.classList.toggle("defeated", game.player.health <= 0);
    elements.playerHero.classList.toggle(
      "ready",
      game.player.heroCanAttack && !uiState.busy,
    );
    elements.playerHero.classList.toggle(
      "selected",
      uiState.selectedAttackerId === "hero",
    );
    elements.endTurn.disabled =
      uiState.busy ||
      game.phase !== "playing" ||
      game.activeSide !== "player";
    elements.restart.disabled = uiState.busy;

    this.renderMana(elements.playerMana, game.player);
    this.renderMana(elements.enemyMana, game.enemy);
    this.renderWeapon("player", game.player.weapon);
    this.renderWeapon("enemy", game.enemy.weapon);
    this.renderEnemyHand(game.enemy.handCount);
    this.renderPlayerHand(game, uiState);
    this.renderBoard("player", game, uiState);
    this.renderBoard("enemy", game, uiState);
    this.renderLogs(game.logs);
    if (game.encounter && !attacker) this.renderEncounter(game.encounter);
  }

  turnLabel(game) {
    if (game.phase === "gameOver") return this.i18n.t("battle.gameOver");
    return game.activeSide === "player"
      ? this.i18n.t("battle.yourTurn")
      : this.i18n.t("battle.enemyTurn");
  }

  actionStatus(game, attacker, uiState) {
    if (uiState.busy) return uiState.busyLabel;
    if (attacker) {
      return this.i18n.t("battle.waitingTarget", {
        name: this.i18n.entity(attacker.role),
      });
    }
    if (game.phase === "gameOver") return this.i18n.t("battle.finished");
    return game.activeSide === "player"
      ? this.i18n.t("battle.waiting")
      : this.i18n.t("battle.enemyActing");
  }

  renderMana(container, player) {
    container.innerHTML = "";
    const total = Math.max(player.maxMana, 1);
    for (let index = 1; index <= total; index += 1) {
      const gem = document.createElement("span");
      gem.className = `mana-gem${index <= player.mana ? " full" : ""}`;
      container.appendChild(gem);
    }
  }

  renderEnemyHand(count) {
    this.elements.enemyHand.innerHTML = "";
    for (let index = 0; index < count; index += 1) {
      const back = document.createElement("div");
      back.className = "card-back";
      back.dataset.mark = this.i18n.t("brand.mark");
      back.style.setProperty("--card-index", index);
      this.elements.enemyHand.appendChild(back);
    }
  }

  renderWeapon(side, weapon) {
    const slot =
      side === "player"
        ? this.elements.playerWeapon
        : this.elements.enemyWeapon;
    const name =
      side === "player"
        ? this.elements.playerWeaponName
        : this.elements.enemyWeaponName;
    const stats =
      side === "player"
        ? this.elements.playerWeaponStats
        : this.elements.enemyWeaponStats;
    slot.hidden = !weapon;
    if (!weapon) return;
    name.textContent = this.i18n.card(weapon).role;
    stats.textContent = this.i18n.t("battle.weaponStats", {
      attack: weapon.currentAttack,
      durability: weapon.currentDurability,
    });
  }

  renderPlayerHand(game, uiState) {
    const container = this.elements.playerHand;
    container.innerHTML = "";
    if (!game.player.hand.length) {
      container.appendChild(this.emptyState(this.i18n.t("battle.handEmpty")));
      return;
    }

    game.player.hand.forEach((card) => {
      const node = this.cards.render(card, "hand");
      node.classList.toggle("playable", card.playable && !uiState.busy);
      node.classList.toggle("disabled", !card.playable || uiState.busy);
      node.addEventListener("click", () => this.callbacks.playCard(card));
      this.cards.attachInspector(node, card);
      container.appendChild(node);
    });
  }

  renderBoard(side, game, uiState) {
    const container =
      side === "player" ? this.elements.playerBoard : this.elements.enemyBoard;
    const board = game[side].board;
    const attacker =
      uiState.selectedAttackerId === "hero" && game.player.weapon
        ? { instanceId: "hero", attackRestriction: null }
        : game.player.board.find(
            (card) => card.instanceId === uiState.selectedAttackerId,
          );
    const taunts = game.enemy.board.filter((card) =>
      card.keywords.includes("taunt"),
    );
    container.innerHTML = "";

    if (!board.length) {
      const label =
        side === "player"
          ? this.i18n.t("battle.ourBoardEmpty")
          : this.i18n.t("battle.enemyBoardEmpty");
      container.appendChild(this.emptyState(label));
      return;
    }

    board.forEach((card) => {
      const node = this.cards.render(card, "board");
      node.classList.toggle(
        "selected",
        uiState.selectedAttackerId === card.instanceId,
      );
      node.classList.toggle(
        "ready",
        side === "player" && card.canAttack && !uiState.busy,
      );
      node.classList.toggle(
        "exhausted",
        side === "player" && !card.canAttack,
      );

      if (side === "player") {
        node.addEventListener("click", () =>
          this.callbacks.selectAttacker(card),
        );
      } else {
        const targetable =
          Boolean(attacker) &&
          (!taunts.length || card.keywords.includes("taunt"));
        node.classList.toggle("targetable", targetable);
        node.addEventListener("click", () => {
          if (targetable) this.callbacks.attackTarget(card.instanceId);
        });
      }
      this.cards.attachInspector(node, card);
      container.appendChild(node);
    });
  }

  renderLogs(logs) {
    this.elements.logList.innerHTML = "";
    logs.forEach((entry, index) => {
      const item = document.createElement("li");
      item.dataset.tone = entry.tone;
      const sequence = document.createElement("span");
      sequence.textContent = String(logs.length - index).padStart(2, "0");
      const copy = document.createElement("p");
      copy.textContent = this.i18n.log(entry);
      item.append(sequence, copy);
      this.elements.logList.appendChild(item);
    });
  }

  renderEncounter(encounter) {
    const translated = this.i18n.stage(encounter);
    const elements = this.elements;
    elements.inspector.className =
      "sidebar-panel inspector-panel palette-crimson";
    elements.inspectorMotif.textContent =
      this.i18n.locale === "en"
        ? translated.bossName.slice(0, 1).toUpperCase()
        : encounter.bossName.slice(0, 1);
    elements.inspectorStar.textContent = this.i18n.t("battle.encounter", {
      movie: this.i18n.movie(encounter.movie),
    });
    elements.inspectorTitle.textContent = translated.mechanicTitle;
    elements.inspectorMovie.textContent = this.i18n.t("battle.stageBoss", {
      order: encounter.order,
      boss: translated.bossName,
    });
    elements.inspectorText.textContent = translated.mechanicText;
    elements.inspectorStats.hidden = true;
  }

  emptyState(label) {
    const node = document.createElement("div");
    node.className = "zone-empty";
    node.innerHTML = `<span aria-hidden="true">◇</span><small>${label}</small>`;
    return node;
  }
}
