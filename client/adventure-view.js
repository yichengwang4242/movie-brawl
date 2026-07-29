export class AdventureView {
  constructor(elements, callbacks, i18n) {
    this.elements = elements;
    this.callbacks = callbacks;
    this.i18n = i18n;
    this.payload = null;
    this.selectedStageId = null;
    this.bindEvents();
  }

  bindEvents() {
    this.elements.practiceButton.addEventListener("click", () =>
      this.callbacks.startPractice(),
    );
    this.elements.stageStartButton.addEventListener("click", () => {
      const stage = this.selectedStage();
      if (stage?.unlocked) this.callbacks.startStage(stage.id);
    });
  }

  render(payload) {
    this.payload = payload;
    const adventure = payload.adventures[0];
    if (!adventure) return;
    const firstAvailable =
      adventure.stages.find(
        (stage) => stage.unlocked && !stage.completed,
      ) || adventure.stages[adventure.stages.length - 1];
    const current = adventure.stages.find(
      (stage) => stage.id === this.selectedStageId,
    );
    this.selectedStageId = (current || firstAvailable).id;

    this.elements.adventureProgressCount.textContent =
      `${adventure.completedCount} / ${adventure.stages.length}`;
    this.elements.adventureProgressBar.style.width =
      `${(adventure.completedCount / adventure.stages.length) * 100}%`;
    this.elements.adventureOwnedCount.textContent =
      this.i18n.t("adventure.owned", {
        count: payload.profile.ownedCardIds.length,
      });
    this.renderStages(adventure.stages);
    this.renderBrief();
  }

  renderStages(stages) {
    const container = this.elements.adventureStageList;
    container.innerHTML = "";
    for (const stage of stages) {
      const translated = this.i18n.stage(stage);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "stage-node";
      button.classList.toggle("selected", stage.id === this.selectedStageId);
      button.classList.toggle("completed", stage.completed);
      button.classList.toggle("locked", !stage.unlocked);
      button.classList.toggle("boss-stage", stage.bossType !== "small");
      button.disabled = !stage.unlocked;
      button.innerHTML = `
        <span class="stage-number">${String(stage.order).padStart(2, "0")}</span>
        <span class="stage-node-copy">
          <small>${this.i18n.formatMovie(stage.movie)}</small>
          <strong>${translated.title}</strong>
          <span>${translated.bossName}</span>
        </span>
        <span class="stage-status">${
          stage.completed
            ? this.i18n.t("adventure.completed")
            : stage.unlocked
              ? this.bossLabel(stage.bossType)
              : this.i18n.t("adventure.locked")
        }</span>
      `;
      button.addEventListener("click", () => {
        this.selectedStageId = stage.id;
        this.renderStages(stages);
        this.renderBrief();
      });
      container.appendChild(button);
    }
  }

  selectedStage() {
    return this.payload?.adventures[0]?.stages.find(
      (stage) => stage.id === this.selectedStageId,
    );
  }

  renderBrief() {
    const stage = this.selectedStage();
    if (!stage) return;
    const translated = this.i18n.stage(stage);
    const elements = this.elements;
    elements.stageBriefNumber.textContent = this.i18n.t("adventure.stage", {
      order: stage.order,
    });
    elements.stageBriefType.textContent = this.bossLabel(stage.bossType);
    elements.stagePoster.className = `stage-poster palette-${
      stage.bossType === "final"
        ? "amber"
        : stage.bossType === "mid"
          ? "crimson"
          : "steel"
    }`;
    elements.stagePosterMotif.textContent =
      this.i18n.locale === "en"
        ? translated.bossName.slice(0, 1).toUpperCase()
        : stage.bossName.slice(0, 1);
    elements.stageBriefMovie.textContent = this.i18n.formatMovie(stage.movie);
    elements.stageBriefTitle.textContent = translated.title;
    elements.stageBossName.textContent = translated.bossName;
    elements.stageMechanicTitle.textContent = translated.mechanicTitle;
    elements.stageMechanicText.textContent = translated.mechanicText;
    elements.stageRewardCopy.textContent =
      stage.bossType === "small"
        ? this.i18n.t("adventure.smallReward")
        : this.i18n.t("adventure.bossReward", {
            card: this.i18n.card(stage.rewardCards[0]).role,
          });
    elements.stageStartButton.disabled =
      !stage.unlocked || Boolean(this.payload.pendingReward);
    elements.stageStartButton.firstChild.textContent = stage.completed
      ? this.i18n.t("adventure.retry")
      : stage.unlocked
        ? this.i18n.t("adventure.enter")
        : this.i18n.t("adventure.notUnlocked");
  }

  bossLabel(type) {
    return this.i18n.t(
      type === "final"
        ? "adventure.finalBoss"
        : type === "mid"
          ? "adventure.midBoss"
          : "adventure.smallBoss",
    );
  }
}
