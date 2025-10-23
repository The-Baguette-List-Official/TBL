import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import Packs from './pages/Packs.js' ;
export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/roulette', component: Roulette },
    { path: '/packs', component: Packs }
];

const packs = [
  {
    name: "The Former Top 1's",
    levels: ["Colorblind", "Champions Road", "My spike is laggy"],
    bonusPoints: 150
  }
];

// Function to render all packs into the #packs-container element
function renderPacks() {
  const container = document.getElementById("packs-container");
  if (!container) return; // Safety: tab not rendered yet

  container.innerHTML = ""; // Clear previous content

  packs.forEach(pack => {
    const packCard = document.createElement("div");
    packCard.className = "pack-card";

    packCard.innerHTML = `
      <h3>${pack.name}</h3>
      <ul>
        ${pack.levels.map(level => `<li>${level}</li>`).join("")}
      </ul>
      <p class="bonus">Bonus: +${pack.bonusPoints} pts</p>
    `;

    container.appendChild(packCard);
  });
}

// Attach renderPacks when the "Packs" tab is opened
document.addEventListener("DOMContentLoaded", () => {
  const packsTab = document.querySelector('[data-tab="packs"]');
  if (packsTab) {
    packsTab.addEventListener("click", () => {
      renderPacks();
    });
  }
});

