import { createElement } from "../utils/dom.js"; //

const packs = [
  {
    name: "Starter Pack",
    levels: ["Level 1", "Level 2", "Level 3"],
    bonusPoints: 50,
  },
];

export function renderPacksPage() {
  const container = document.createElement("div");
  container.id = "packs-container";
  container.className = "packs-grid";

  packs.forEach((pack) => {
    const card = createElement("div", { class: "pack-card" });

    const title = createElement("h3", {}, pack.name);

    const list = createElement("ul");
    pack.levels.forEach((level) => {
      list.appendChild(createElement("li", {}, level));
    });

    const bonus = createElement(
      "p",
      { class: "bonus" },
      `Bonus: +${pack.bonusPoints} pts`
    );

    card.appendChild(title);
    card.appendChild(list);
    card.appendChild(bonus);
    container.appendChild(card);
  });

  return container;
}

// Default export for router compatibility
export default {
  name: "packs",
  render: renderPacksPage,
};