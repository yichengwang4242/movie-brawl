export class AdventureView {
  constructor(elements, callbacks, i18n) {
    this.elements = elements;
    this.callbacks = callbacks;
    this.i18n = i18n;
    this.payload = null;
    this.selectedAdventureId = null;
    this.selectedStageIds = new Map();
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
    const adventure =
      payload.adventures.find(
        (candidate) => candidate.id === this.selectedAdventureId,
      ) || payload.adventures[0];
    if (!adventure) return;
    this.selectedAdventureId = adventure.id;
    const firstAvailable =
      adventure.stages.find(
        (stage) => stage.unlocked && !stage.completed,
      ) || adventure.stages[adventure.stages.length - 1];
    const current = adventure.stages.find((stage) =>
      stage.id === this.selectedStageIds.get(adventure.id));
    this.selectedStageIds.set(adventure.id, (current || firstAvailable).id);

    this.renderStudioTabs();
    this.renderHeader(adventure);
    this.elements.adventureProgressCount.textContent =
      `${adventure.completedCount} / ${adventure.stages.length}`;
    this.elements.adventureProgressBar.style.width =
      `${(adventure.completedCount / adventure.stages.length) * 100}%`;
    this.elements.adventureOwnedCount.textContent =
      this.i18n.t("adventure.owned", {
        count: adventure.ownedCount,
      });
    this.renderStages(adventure.stages);
    this.renderBrief();
  }

  renderStudioTabs() {
    const container = this.elements.adventureStudioTabs;
    container.innerHTML = "";
    for (const adventure of this.payload.adventures) {
      const translated = this.i18n.adventure(adventure);
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.className = "studio-tab";
      button.classList.toggle("active", adventure.id === this.selectedAdventureId);
      button.setAttribute(
        "aria-selected",
        String(adventure.id === this.selectedAdventureId),
      );
      button.innerHTML = `
        <span aria-hidden="true">${
          this.i18n.locale === "en"
            ? translated.name.slice(0, 1).toUpperCase()
            : adventure.motif
        }</span>
        <strong>${translated.name}</strong>
        <small>${adventure.completedCount}/${adventure.stages.length}</small>
      `;
      button.addEventListener("click", () => {
        this.selectedAdventureId = adventure.id;
        this.render(this.payload);
      });
      container.appendChild(button);
    }
  }

  renderHeader(adventure) {
    const translated = this.i18n.adventure(adventure);
    const elements = this.elements;
    elements.adventureHeader.dataset.adventure = adventure.id;
    elements.adventureEmblem.textContent =
      this.i18n.locale === "en"
        ? translated.name.slice(0, 1).toUpperCase()
        : adventure.motif;
    elements.adventureKicker.textContent = translated.kicker;
    elements.adventureName.textContent = translated.name;
    elements.adventureSubtitle.textContent = translated.subtitle;
    elements.adventureStageMap.setAttribute(
      "aria-label",
      this.i18n.t("adventure.mapFor", { studio: translated.name }),
    );
  }

  renderStages(stages) {
    const container = this.elements.adventureStageList;
    container.innerHTML = "";
    for (const stage of stages) {
      const translated = this.i18n.stage(stage);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "stage-node";
      button.classList.toggle(
        "selected",
        stage.id === this.selectedStageIds.get(this.selectedAdventureId),
      );
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
        this.selectedStageIds.set(this.selectedAdventureId, stage.id);
        this.renderStages(stages);
        this.renderBrief();
      });
      container.appendChild(button);
    }
  }

  selectedStage() {
    return this.selectedAdventure()?.stages.find(
      (stage) => stage.id === this.selectedStageIds.get(this.selectedAdventureId),
    );
  }

  selectedAdventure() {
    return this.payload?.adventures.find(
      (adventure) => adventure.id === this.selectedAdventureId,
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
        ? this.i18n.t("adventure.smallReward", {
            studio: this.i18n.adventure(this.selectedAdventure()).name,
          })
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
