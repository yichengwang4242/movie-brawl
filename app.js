import { GameController } from "./client/game-controller.js";
import { I18n } from "./client/i18n.js";

const registry = await window.MOVIE_BRAWL_STUDIO_REGISTRY.loadBrowser();
const i18n = new I18n(window.CARD_POOL, {
  stages: registry.adventures.flatMap((adventure) => adventure.stages),
});
const controller = new GameController(window.CARD_POOL, i18n);
controller.start();
