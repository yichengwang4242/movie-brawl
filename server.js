"use strict";

const http = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { GameService } = require("./server/game-service.js");
const { GameRuleError } = require("./server/game-engine.js");
const { AdventureService } = require("./server/adventure/adventure-service.js");
const {
  JsonProfileRepository,
} = require("./server/adventure/profile-repository.js");
const { StaticFileCatalog } = require("./server/static-file-catalog.js");

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

async function serveStatic(response, pathname, staticFiles) {
  const entry = staticFiles.resolve(pathname);
  if (!entry) return false;
  const content = await readFile(entry.filename);
  response.writeHead(200, {
    "Content-Type": entry.contentType,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(content);
  return true;
}

async function handleApi(request, response, pathname, services) {
  const { adventures, games } = services;
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
      games.create({
        seed: body.seed,
        difficulty: body.difficulty,
        stageId: body.stageId,
      }),
    );
    return true;
  }

  const gameRoute = pathname.match(/^\/api\/games\/([a-f0-9-]+)$/);
  if (request.method === "GET" && gameRoute) {
    const game = games.get(gameRoute[1]);
    if (!game) {
      sendJson(response, 404, {
        error: "GAME_NOT_FOUND",
        message: "这局游戏不存在或已经过期。",
      });
    } else {
      sendJson(response, 200, game);
    }
    return true;
  }

  const actionRoute = pathname.match(
    /^\/api\/games\/([a-f0-9-]+)\/actions$/,
  );
  if (request.method === "POST" && actionRoute) {
    const game = games.act(actionRoute[1], await readJson(request));
    if (!game) {
      sendJson(response, 404, {
        error: "GAME_NOT_FOUND",
        message: "这局游戏不存在或已经过期。",
      });
    } else {
      sendJson(response, 200, game);
    }
    return true;
  }

  return false;
}

function createMovieBrawlServer(options = {}) {
  const root = options.root || __dirname;
  const adventures =
    options.adventureService ||
    new AdventureService({
      repository:
        options.profileRepository ||
        new JsonProfileRepository(path.join(root, "data", "profile.json")),
    });
  const games = options.gameService || new GameService({
    adventureService: adventures,
  });
  const staticFiles = options.staticFiles || new StaticFileCatalog(root);
  const services = { adventures, games };

  return http.createServer(async (request, response) => {
    try {
      const url = new URL(
        request.url,
        `http://${request.headers.host || "127.0.0.1"}`,
      );
      if (url.pathname.startsWith("/api/")) {
        const handled = await handleApi(
          request,
          response,
          url.pathname,
          services,
        );
        if (!handled) {
          sendJson(response, 404, {
            error: "NOT_FOUND",
            message: "接口不存在。",
          });
        }
        return;
      }

      if (!(await serveStatic(response, url.pathname, staticFiles))) {
        response.writeHead(404, {
          "Content-Type": "text/plain; charset=utf-8",
        });
        response.end("Not found");
      }
    } catch (error) {
      if (error instanceof GameRuleError) {
        sendJson(response, 400, { error: error.code, message: error.message });
        return;
      }
      console.error(error);
      sendJson(response, 500, {
        error: "INTERNAL_ERROR",
        message: "片场暂时出了问题。",
      });
    }
  });
}

if (require.main === module) {
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 4173);
  createMovieBrawlServer().listen(port, host, () => {
    console.log(`电影大乱斗已启动：http://${host}:${port}`);
  });
}

module.exports = {
  createMovieBrawlServer,
  handleApi,
  readJson,
  sendJson,
  serveStatic,
};
