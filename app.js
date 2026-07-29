import { GameController } from "./client/game-controller.js";
import { I18n } from "./client/i18n.js";

const i18n = new I18n(
  window.CARD_POOL,
  window.MOVIE_BRAWL_SHAW_ADVENTURE,
);
const controller = new GameController(window.CARD_POOL, i18n);
controller.start();
