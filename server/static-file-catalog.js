"use strict";

const path = require("node:path");
const studioRegistry = require("../studio-registry.js");

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
]);

class StaticFileCatalog {
  constructor(root) {
    this.root = root;
    this.rootFiles = new Set([
      "index.html",
      "styles.css",
      "app.js",
      "favicon.svg",
      "card-builders.js",
      "studio-registry.js",
      "starter-cards.js",
      "expansion-data.js",
      "game-data.js",
      ...studioRegistry.descriptors.flatMap((entry) => [
        entry.cardModule.replace(/^\.\//, ""),
        entry.adventureModule.replace(/^\.\//, ""),
        entry.artFile,
      ]),
    ]);
  }

  resolve(pathname) {
    const relative = pathname === "/" ? "index.html" : pathname.slice(1);
    const allowedDirectory = /^(client|localization)\/[a-z0-9-]+\.js$/.test(
      relative,
    );
    if (!this.rootFiles.has(relative) && !allowedDirectory) return null;
    const extension = path.extname(relative);
    const contentType = MIME_TYPES.get(extension);
    if (!contentType) return null;
    return {
      filename: path.join(this.root, relative),
      contentType,
    };
  }
}

module.exports = { StaticFileCatalog };
