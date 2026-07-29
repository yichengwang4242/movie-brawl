import { queryElements } from "./elements.js";
import { GameApiClient } from "./game-api-client.js";
import { CardRenderer } from "./card-renderer.js";
import { BattleView } from "./battle-view.js";
import { CollectionView } from "./collection-view.js";
import { AdventureView } from "./adventure-view.js";
import { OutcomeView } from "./outcome-view.js";
import { FeedbackView } from "./feedback-view.js";
import { PlayabilityFeedback } from "./playability-feedback.js";
export class GameController {
  constructor(cardPool, i18n) {
    this.elements = queryElements();
    this.i18n = i18n;
    this.i18n.applyDocument();
    this.i18n.bindSelect(this.elements.languageSelect);
    this.api = new GameApiClient();
    this.feedback = new FeedbackView(this.elements, this.i18n);
    this.playability = new PlayabilityFeedback(this.i18n);
    this.cardRenderer = new CardRenderer(this.elements, this.i18n);
    this.collectionView = new CollectionView(
      this.elements,
      this.cardRenderer,
      cardPool,
      this.i18n,
    );
    this.adventureView = new AdventureView(
      this.elements,
      {
        startStage: (stageId) => this.startAdventure(stageId),
        startPractice: () => this.startPractice(),
      },
      this.i18n,
    );
    this.battleView = new BattleView(
      this.elements,
      this.cardRenderer,
      this.createBattleCallbacks(),
      this.i18n,
    );
    this.outcomeView = new OutcomeView(
      this.elements,
      this.cardRenderer,
      {
        rematch: () => this.restartCurrentGame(),
        claimReward: (stageId, cardId) => this.claimReward(stageId, cardId),
      },
      this.i18n,
    );
    this.game = null;
    this.adventureState = null;
    this.currentStageId = null;
    this.selectedAttackerId = null;
    this.busy = false;
    this.busyKey = "";
    this.bindShellEvents();
    this.i18n.onChange(() => this.handleLocaleChange());
  }

  async start() {
    this.collectionView.render();
    try {
      await this.loadAdventures();
      this.feedback.setConnection(true);
    } catch (error) {
      this.feedback.setConnection(false);
      this.feedback.showToast(this.i18n.error(error), "error");
    } finally {
      this.feedback.hideBootScreen();
    }
  }

  createBattleCallbacks() {
    return {
      playCard: (card) => this.playCard(card),
      selectAttacker: (card) => this.selectAttacker(card),
      selectHero: () => this.selectHero(),
      attackTarget: (target) => this.attackTarget(target),
    };
  }

  async loadAdventures() {
    this.adventureState = await this.api.getAdventures();
    this.collectionView.setOwnedCards(
      this.adventureState.profile.ownedCardIds,
    );
    this.adventureView.render(this.adventureState);
    if (this.adventureState.pendingReward) {
      this.outcomeView.showPendingReward(this.adventureState.pendingReward);
    }
  }

  startPractice() {
    return this.startGame(null);
  }

  startAdventure(stageId) {
    return this.startGame(stageId);
  }

  restartCurrentGame() {
    return this.startGame(this.currentStageId);
  }

  async startGame(stageId) {
    this.setBusy(true, "busy.creating");
    this.selectedAttackerId = null;
    this.currentStageId = stageId;
    this.elements.gameOver.hidden = true;
    try {
      this.game = stageId
        ? await this.api.createAdventureGame(stageId)
        : await this.api.createGame(this.elements.aiDifficulty.value);
      this.elements.tabs.forEach((tab) => {
        if (tab.dataset.view === "battle") tab.disabled = false;
      });
      this.feedback.setConnection(true);
      this.activateView("battle");
      this.render();
    } catch (error) {
      this.feedback.setConnection(error.code !== "REQUEST_FAILED");
      this.feedback.showToast(this.i18n.error(error), "error");
    } finally {
      this.setBusy(false);
    }
  }

  async claimReward(stageId, cardId) {
    this.setBusy(true, "busy.reward");
    try {
      const result = await this.api.claimReward(stageId, cardId);
      this.adventureState = result;
      this.collectionView.setOwnedCards(result.profile.ownedCardIds);
      this.adventureView.render(result);
      this.elements.gameOver.hidden = true;
      this.activateView("adventure");
      this.feedback.showToast(
        this.i18n.t("toast.rewardAdded", {
          card: this.i18n.card(result.card).role,
        }),
      );
    } catch (error) {
      this.feedback.showToast(this.i18n.error(error), "error");
    } finally {
      this.setBusy(false);
    }
  }

  async dispatch(action) {
    if (!this.game || this.busy || this.game.phase !== "playing") return;
    const busyKey =
      action.type === "END_TURN" ? "busy.enemy" : "busy.action";
    this.setBusy(true, busyKey);
    try {
      this.game = await this.api.performAction(this.game.gameId, action);
      this.selectedAttackerId = null;
      this.feedback.setConnection(true);
      this.render();
    } catch (error) {
      this.feedback.setConnection(error.code !== "REQUEST_FAILED");
      this.feedback.showToast(this.i18n.error(error), "error");
    } finally {
      this.setBusy(false);
    }
  }

  setBusy(busy, key = "") {
    this.busy = busy;
    this.busyKey = key;
    this.feedback.setBusy(busy);
    if (this.game) this.renderBattle();
  }

  selectedAttacker() {
    if (this.selectedAttackerId === "hero" && this.game?.player.weapon) {
      return {
        instanceId: "hero",
        role: this.game.player.weapon.role,
        currentAttack: this.game.player.weapon.currentAttack,
        attackRestriction: null,
      };
    }
    return this.game?.player.board.find(
      (card) => card.instanceId === this.selectedAttackerId,
    );
  }

  selectAttacker(card) {
    if (this.busy || this.game.activeSide !== "player" || !card.canAttack) return;
    this.selectedAttackerId =
      this.selectedAttackerId === card.instanceId ? null : card.instanceId;
    if (this.selectedAttackerId) this.cardRenderer.inspect(card);
    this.renderBattle();
  }

  selectHero() {
    if (this.busy || !this.game.player.heroCanAttack) return;
    this.selectedAttackerId =
      this.selectedAttackerId === "hero" ? null : "hero";
    if (this.selectedAttackerId) {
      this.cardRenderer.inspect(this.game.player.weapon);
    }
    this.renderBattle();
  }

  attackTarget(target) {
    const attacker = this.selectedAttacker();
    if (!attacker) return;
    if (attacker.instanceId === "hero") {
      this.dispatch({ type: "HERO_ATTACK", target });
    } else {
      this.dispatch({
        type: "ATTACK",
        attackerId: attacker.instanceId,
        target,
      });
    }
  }

  playCard(card) {
    if (!card.playable) {
      this.feedback.showToast(
        this.playability.reason(card, this.game),
        "warning",
      );
      return;
    }
    this.dispatch({ type: "PLAY_CARD", cardId: card.instanceId });
  }

  render() {
    if (!this.game) return;
    this.renderBattle();
    this.outcomeView.render(this.game);
  }

  renderBattle() {
    this.battleView.render(this.game, {
      selectedAttackerId: this.selectedAttackerId,
      busy: this.busy,
      busyLabel: this.busyKey ? this.i18n.t(this.busyKey) : "",
    });
  }

  bindShellEvents() {
    this.elements.tabs.forEach((tab) => {
      tab.addEventListener("click", () => this.showView(tab));
    });
    this.elements.endTurn.addEventListener("click", () =>
      this.dispatch({ type: "END_TURN" }),
    );
    this.elements.restart.addEventListener("click", () =>
      this.restartCurrentGame(),
    );
    this.elements.enemyHero.addEventListener("click", () => {
      if (this.elements.enemyHero.classList.contains("targetable")) {
        this.attackTarget("hero");
      }
    });
    this.elements.playerHero.addEventListener("click", () => this.selectHero());
    this.elements.aiDifficulty.addEventListener("change", () => {
      if (!this.currentStageId) this.startPractice();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.selectedAttackerId) {
        this.selectedAttackerId = null;
        this.renderBattle();
      }
    });
  }

  handleLocaleChange() {
    this.collectionView.setupFilters();
    this.collectionView.render();
    if (this.adventureState) {
      this.adventureView.render(this.adventureState);
    }
    if (this.game) {
      this.render();
    } else if (this.adventureState?.pendingReward) {
      this.outcomeView.showPendingReward(this.adventureState.pendingReward);
    }
    this.feedback.setConnection(this.feedback.online);
  }

  showView(activeTab) {
    this.activateView(activeTab.dataset.view);
  }

  activateView(view) {
    this.elements.tabs.forEach((tab) =>
      tab.classList.toggle("active", tab.dataset.view === view),
    );
    this.elements.views.forEach((element) =>
      element.classList.toggle("active", element.id === `${view}-view`),
    );
  }
}
