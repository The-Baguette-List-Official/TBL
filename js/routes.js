import List from "./pages/List.js";
import Roulette from "./pages/Roulette.js";
import Leaderboard from "./pages/Leaderboard.js";

export default [
  { path: "/", component: List },
  { path: "/roulette", component: Roulette },
  { path: "/leaderboard", component: Leaderboard }
];
