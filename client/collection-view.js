export class CollectionView {
  constructor(elements, cardRenderer, cardPool, i18n) {
    this.elements = elements;
    this.cards = cardRenderer;
    this.cardPool = cardPool;
    this.i18n = i18n;
    this.ownedCardIds = new Set();
    this.setupFilters();
    this.bindEvents();
  }

  setupFilters() {
    const selected = this.elements.starFilter.value || "all";
    const options = [...new Set([
      "all",
      ...new Set(this.cardPool.allCards.map((card) => card.star)),
      "通用",
    ])];
    this.elements.starFilter.innerHTML = "";
    options.forEach((option) => {
      const node = document.createElement("option");
      node.value = option;
      node.textContent =
        option === "all"
          ? this.i18n.t("collection.allStars")
          : this.i18n.entity(option);
      this.elements.starFilter.appendChild(node);
    });
    this.elements.starFilter.value = options.includes(selected)
      ? selected
      : "all";
  }

  bindEvents() {
    this.elements.cardSearch.addEventListener("input", () => this.render());
    this.elements.starFilter.addEventListener("change", () => this.render());
    this.elements.typeFilter.addEventListener("change", () => this.render());
  }

  setOwnedCards(cardIds) {
    this.ownedCardIds = new Set(cardIds || []);
    this.render();
  }

  render() {
    const term = this.elements.cardSearch.value.trim().toLowerCase();
    const star = this.elements.starFilter.value;
    const type = this.elements.typeFilter.value;
    const cards = this.cardPool.allCards.filter((card) => {
      const matchesType = type === "all" || card.type === type;
      const matchesStar =
        star === "all" ||
        card.star === star ||
        (star === "通用" && ["spell", "weapon"].includes(card.type));
      const translated = this.i18n.card(card);
      const searchable = [
        card.star,
        card.role,
        card.movie,
        card.text,
        translated.star,
        translated.role,
        translated.movie,
        translated.text,
      ]
        .join(" ")
        .toLowerCase();
      return matchesType && matchesStar && (!term || searchable.includes(term));
    });

    const unlocked = cards.filter(
      (card) => !card.adventure || this.ownedCardIds.has(card.id),
    ).length;
    this.elements.collectionCount.textContent =
      this.i18n.t("collection.count", {
        unlocked,
        total: cards.length,
      });
    this.elements.collectionGrid.innerHTML = "";
    cards.forEach((card) => {
      const node = this.cards.render(card, "collection");
      const locked = Boolean(
        card.adventure && !this.ownedCardIds.has(card.id),
      );
      node.classList.toggle("locked-card", locked);
      if (locked) {
        const lock = document.createElement("span");
        lock.className = "card-lock";
        lock.textContent = this.i18n.t("collection.locked");
        node.appendChild(lock);
      }
      this.cards.attachInspector(node, card);
      this.elements.collectionGrid.appendChild(node);
    });
  }
}
