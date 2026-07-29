"use strict";

const http = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { GameService } = require("./server/game-service.js");
const { GameRuleError } = require("./server/game-engine.js");
const { AdventureService } = require("./server/adventure/adventure-service.js");
const { JsonProfileRepository } = require("./server/adventure/profile-repository.js");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const root = __dirname;
const adventures = new AdventureService({
  repository: new JsonProfileRepository(path.join(root, "data", "profile.json")),
});
const service = new GameService({ adventureService: adventures });

const staticFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/localization/entities.js", ["localization/entities.js", "text/javascript; charset=utf-8"]],
  ["/localization/movies.js", ["localization/movies.js", "text/javascript; charset=utf-8"]],
  ["/localization/adventures.js", ["localization/adventures.js", "text/javascript; charset=utf-8"]],
  ["/localization/messages.js", ["localization/messages.js", "text/javascript; charset=utf-8"]],
  ["/localization/card-describer.js", ["localization/card-describer.js", "text/javascript; charset=utf-8"]],
  ["/localization/log-translator.js", ["localization/log-translator.js", "text/javascript; charset=utf-8"]],
  ["/localization/i18n.js", ["localization/i18n.js", "text/javascript; charset=utf-8"]],
  ["/game-data.js", ["game-data.js", "text/javascript; charset=utf-8"]],
  ["/expansion-data.js", ["expansion-data.js", "text/javascript; charset=utf-8"]],
  ["/shaw-cards.js", ["shaw-cards.js", "text/javascript; charset=utf-8"]],
  ["/shaw-adventure.js", ["shaw-adventure.js", "text/javascript; charset=utf-8"]],
  ["/starter-cards.js", ["starter-cards.js", "text/javascript; charset=utf-8"]],
  ["/favicon.svg", ["favicon.svg", "image/svg+xml"]],
  ["/assets/shaw-studio-stage.png", ["assets/shaw-studio-stage.png", "image/png"]],
  ["/client/elements.js", ["client/elements.js", "text/javascript; charset=utf-8"]],
  ["/client/i18n.js", ["client/i18n.js", "text/javascript; charset=utf-8"]],
  ["/client/playability-feedback.js", ["client/playability-feedback.js", "text/javascript; charset=utf-8"]],
  ["/client/game-api-client.js", ["client/game-api-client.js", "text/javascript; charset=utf-8"]],
  ["/client/card-renderer.js", ["client/card-renderer.js", "text/javascript; charset=utf-8"]],
  ["/client/battle-view.js", ["client/battle-view.js", "text/javascript; charset=utf-8"]],
  ["/client/collection-view.js", ["client/collection-view.js", "text/javascript; charset=utf-8"]],
  ["/client/feedback-view.js", ["client/feedback-view.js", "text/javascript; charset=utf-8"]],
  ["/client/game-controller.js", ["client/game-controller.js", "text/javascript; charset=utf-8"]],
  ["/client/adventure-view.js", ["client/adventure-view.js", "text/javascript; charset=utf-8"]],
  ["/client/outcome-view.js", ["client/outcome-view.js", "text/javascript; charset=utf-8"]],
]);

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 64 * 1024) {
      throw new GameRuleError("BODY_TOO_LARGE", "请求内容过大。");
    }
  }
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new GameRuleError("INVALID_JSON", "请求内容不是有效 JSON。");
  }
}

async function serveStatic(response, pathname) {
  const entry = staticFiles.get(pathname);
  if (!entry) return false;
  const [filename, contentType] = entry;
  const content = await readFile(path.join(root, filename));
  response.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(content);
  return true;
}

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/health") {
    sendJson(response, 200, { ok: true, service: "movie-brawl", version: 1 });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/adventures") {
    sendJson(response, 200, adventures.state());
    return true;
  }

  if (
    request.method === "POST" &&
    pathname === "/api/adventures/rewards/claim"
  ) {
    const body = await readJson(request);
    sendJson(response, 200, adventures.claim(body.stageId, body.cardId));
    return true;
  }

  if (request.method === "POST" && pathname === "/api/games") {
    const body = await readJson(request);
    sendJson(
      response,
      201,
      service.create({
        seed: body.seed,
        difficulty: body.difficulty,
        stageId: body.stageId,
      }),
    );
    return true;
  }

  const gameRoute = pathname.match(/^\/api\/games\/([a-f0-9-]+)$/);
  if (request.method === "GET" && gameRoute) {
    const game = service.get(gameRoute[1]);
    if (!game) {
      sendJson(response, 404, { error: "GAME_NOT_FOUND", message: "这局游戏不存在或已经过期。" });
    } else {
      sendJson(response, 200, game);
    }
    return true;
  }

  const actionRoute = pathname.match(/^\/api\/games\/([a-f0-9-]+)\/actions$/);
  if (request.method === "POST" && actionRoute) {
    const body = await readJson(request);
    const game = service.act(actionRoute[1], body);
    if (!game) {
      sendJson(response, 404, { error: "GAME_NOT_FOUND", message: "这局游戏不存在或已经过期。" });
    } else {
      sendJson(response, 200, game);
    }
    return true;
  }

  return false;
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(request, response, url.pathname);
      if (!handled) sendJson(response, 404, { error: "NOT_FOUND", message: "接口不存在。" });
      return;
    }

    const handled = await serveStatic(response, url.pathname);
    if (!handled) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  } catch (error) {
    if (error instanceof GameRuleError) {
      sendJson(response, 400, { error: error.code, message: error.message });
      return;
    }
    console.error(error);
    sendJson(response, 500, { error: "INTERNAL_ERROR", message: "片场暂时出了问题。" });
  }
});

server.listen(port, host, () => {
  console.log(`电影大乱斗已启动：http://${host}:${port}`);
});
