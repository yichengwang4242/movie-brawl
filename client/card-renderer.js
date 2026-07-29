export class CardRenderer {
  constructor(elements, i18n) {
    this.elements = elements;
    this.i18n = i18n;
  }

  render(sourceCard, context) {
    const card = this.i18n.card(sourceCard);
    const node =
      this.elements.cardTemplate.content.firstElementChild.cloneNode(true);
    node.classList.add(`palette-${card.palette || "gold"}`);
    node.classList.toggle("spell-card", card.type === "spell");
    node.classList.toggle("weapon-card", card.type === "weapon");
    node.dataset.instanceId = card.instanceId || card.id;
    node.tabIndex = 0;
    node.setAttribute(
      "aria-label",
      this.i18n.t("card.aria", {
        name: card.role,
        cost: card.cost,
        text: card.text,
      }),
    );
    const costNode = node.querySelector(".card-cost");
    const attackNode = node.querySelector(".card-attack");
    const healthNode = node.querySelector(".card-health");
    costNode.textContent = card.cost;
    costNode.title = this.i18n.t("card.costTitle");
    attackNode.title = this.i18n.t("card.attackTitle");
    healthNode.title = this.i18n.t(
      card.type === "weapon" ? "card.durabilityTitle" : "card.healthTitle",
    );
    node.querySelector(".card-mark").textContent =
      card.motif || this.i18n.t("brand.mark");
    node.querySelector(".card-rarity").textContent =
      card.rarity || this.i18n.t("card.classic");
    node.querySelector(".card-star").textContent =
      card.type === "spell"
        ? this.i18n.t("card.studioSpell")
        : card.type === "weapon"
          ? this.i18n.t("card.screenWeapon")
          : card.star;
    node.querySelector(".card-title").textContent = card.role;
    node.querySelector(".card-movie").textContent =
      this.i18n.formatMovie(sourceCard.movie);
    node.querySelector(".card-text").textContent = card.text || "";
    attackNode.textContent = card.currentAttack ?? card.attack;
    healthNode.textContent =
      card.type === "weapon"
        ? (card.currentDurability ?? card.durability)
        : (card.currentHealth ?? card.health);
    if (context === "board") this.addStatusBadges(node, sourceCard);
    return node;
  }

  addStatusBadges(node, card) {
    const names = [];
    const status = (name, params = {}) => [
      this.i18n.t(`status.short.${name}`),
      this.i18n.t(`status.${name}`, params),
    ];
    if (card.keywords.includes("taunt")) names.push(status("taunt"));
    if (card.shield) names.push(status("shield"));
    if (card.keywords.includes("lifesteal")) names.push(status("lifesteal"));
    if (card.attackRestriction === "minions") names.push(status("rush"));
    if (card.stunned) names.push(status("stunned"));
    if (card.keywords.includes("deathrattle")) names.push(status("deathrattle"));
    if (card.reflect > 0 || card.keywords.includes("reflect")) {
      names.push(status("reflect", { amount: card.reflect || 1 }));
    }
    if (card.keywords.includes("fusion")) names.push(status("fusion"));
    if (!names.length) return;

    const badges = document.createElement("div");
    badges.className = "status-badges";
    for (const [shortName, fullName] of names) {
      const badge = document.createElement("span");
      badge.className = "status-badge";
      badge.textContent = shortName;
      badge.title = fullName;
      badges.appendChild(badge);
    }
    node.appendChild(badges);
  }

  attachInspector(node, card) {
    node.addEventListener("pointerenter", () => this.inspect(card));
    node.addEventListener("focus", () => this.inspect(card));
  }

  inspect(card) {
    const translated = this.i18n.card(card);
    const elements = this.elements;
    elements.inspector.className = "sidebar-panel inspector-panel";
    elements.inspector.classList.add(`palette-${card.palette || "gold"}`);
    elements.inspectorMotif.textContent =
      translated.motif || this.i18n.t("brand.mark");
    elements.inspectorStar.textContent =
      card.type === "spell"
        ? this.i18n.t("card.studioSpell")
        : card.type === "weapon"
          ? this.i18n.t("card.screenWeapon")
          : translated.star;
    elements.inspectorTitle.textContent = translated.role;
    elements.inspectorMovie.textContent = this.i18n.formatMovie(card.movie);
    elements.inspectorText.textContent =
      translated.text || this.i18n.t("card.noText");
    elements.inspectorStats.hidden = card.type === "spell";
    elements.inspectorAttack.textContent =
      card.currentAttack ?? card.attack;
    elements.inspectorHealth.textContent =
      card.type === "weapon"
        ? (card.currentDurability ?? card.durability)
        : (card.currentHealth ?? card.health);
    elements.inspectorCost.textContent = card.cost;
  }
}
