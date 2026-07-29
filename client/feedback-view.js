export class FeedbackView {
  constructor(elements, i18n) {
    this.elements = elements;
    this.i18n = i18n;
    this.toastTimer = null;
    this.online = false;
  }

  setBusy(busy) {
    document.body.classList.toggle("is-busy", busy);
  }

  setConnection(online) {
    this.online = online;
    this.elements.serverState.classList.toggle("offline", !online);
    this.elements.serverLabel.textContent = online
      ? this.i18n.t("connection.online")
      : this.i18n.t("connection.offline");
  }

  hideBootScreen() {
    this.elements.bootScreen.classList.add("hidden");
  }

  showToast(message, tone = "normal") {
    window.clearTimeout(this.toastTimer);
    this.elements.toast.textContent = message;
    this.elements.toast.dataset.tone = tone;
    this.elements.toast.hidden = false;
    this.toastTimer = window.setTimeout(() => {
      this.elements.toast.hidden = true;
    }, 2600);
  }

  renderGameOver(game) {
    if (game.phase !== "gameOver") {
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
    this.elements.gameOver.hidden = false;
  }
}
