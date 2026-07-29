export class PlayabilityFeedback {
  constructor(i18n) {
    this.i18n = i18n;
  }

  reason(card, game) {
    if (card.cost > game.player.mana) {
      return this.i18n.t("error.NOT_ENOUGH_MANA");
    }
    if (
      card.type === "role" &&
      game.player.board.length >= game.rules.boardLimit
    ) {
      return this.i18n.t("error.BOARD_FULL");
    }
    if (
      card.requirements?.minFriendly &&
      game.player.board.length < card.requirements.minFriendly
    ) {
      return this.i18n.t("error.REQUIREMENTS_NOT_MET", {
        count: card.requirements.minFriendly,
      });
    }
    return this.i18n.t("error.UNPLAYABLE");
  }
}
