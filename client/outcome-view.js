export class OutcomeView {
  constructor(elements, cardRenderer, callbacks, i18n) {
    this.elements = elements;
    this.cards = cardRenderer;
    this.callbacks = callbacks;
    this.i18n = i18n;
    this.elements.rematch.addEventListener("click", () =>
      this.callbacks.rematch(),
    );
  }

  render(game) {
    if (!game || game.phase !== "gameOver") {
      this.elements.gameOver.hidden = true;
      return;
    }
    this.elements.gameOverMark.textContent = this.i18n.t(
      `outcome.${game.winner}Mark`,
    );
    this.elements.gameOverTitle.textContent = this.i18n.t(
      `outcome.${game.winner}Title`,
    );
    this.elements.gameOverCopy.textContent = this.i18n.t(
      `outcome.${game.winner}Copy`,
    );
    const reward = game.adventure?.pendingReward;
    this.elements.gameOver.classList.toggle("rewarding", Boolean(reward));
    this.elements.rewardPanel.hidden = !reward;
    this.elements.rematch.hidden = Boolean(reward);
    if (reward) this.renderReward(reward);
    this.elements.gameOver.hidden = false;
  }

  showPendingReward(reward) {
    this.elements.gameOverMark.textContent =
      this.i18n.t("outcome.rewardMark");
    this.elements.gameOverTitle.textContent =
      this.i18n.t("outcome.pendingTitle");
    this.elements.gameOverCopy.textContent =
      this.i18n.t("outcome.pendingCopy");
    this.elements.gameOver.classList.add("rewarding");
    this.elements.rewardPanel.hidden = false;
    this.elements.rematch.hidden = true;
    this.renderReward(reward);
    this.elements.gameOver.hidden = false;
  }

  renderReward(reward) {
    const isChoice = reward.cards.length > 1;
    this.elements.rewardTitle.textContent = isChoice
      ? this.i18n.t("outcome.chooseCollection")
      : this.i18n.t("outcome.bossUnlocked");
    this.elements.rewardOptions.innerHTML = "";
    for (const card of reward.cards) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "reward-card-button";
      const cardNode = this.cards.render(card, "reward");
      button.appendChild(cardNode);
      button.addEventListener("click", () =>
        this.callbacks.claimReward(reward.stageId, card.id),
      );
      this.elements.rewardOptions.appendChild(button);
    }
  }
}
