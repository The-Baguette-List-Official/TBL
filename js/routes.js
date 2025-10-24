import List from "./pages/List.js";
import Roulette from "./pages/Roulette.js";
import Leaderboard from "./pages/Leaderboard.js";
import Packs from "./pages/Packs.js";

export default [
  { path: "/", component: List },
  { path: "/roulette", component: Roulette },
  { path: "/leaderboard", component: Leaderboard },
  { path: "/packs", component: Packs }
];
