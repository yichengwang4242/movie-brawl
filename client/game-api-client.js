export class GameApiClient {
  async createGame(difficulty = "normal") {
    return this.request("/api/games", {
      method: "POST",
      body: JSON.stringify({ difficulty }),
    });
  }

  async createAdventureGame(stageId) {
    return this.request("/api/games", {
      method: "POST",
      body: JSON.stringify({ stageId }),
    });
  }

  async getAdventures() {
    return this.request("/api/adventures");
  }

  async claimReward(stageId, cardId) {
    return this.request("/api/adventures/rewards/claim", {
      method: "POST",
      body: JSON.stringify({ stageId, cardId }),
    });
  }

  async performAction(gameId, action) {
    return this.request(`/api/games/${gameId}/actions`, {
      method: "POST",
      body: JSON.stringify(action),
    });
  }

  async request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(payload?.message || "片场连接失败。");
      error.code = payload?.error || "REQUEST_FAILED";
      throw error;
    }
    return payload;
  }
}
