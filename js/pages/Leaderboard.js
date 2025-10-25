import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
  components: { Spinner },
  data: () => ({
    leaderboard: [],
    loading: true,
    selected: 0,
    err: [],
    packs: [], // will fetch from packs.json
  }),
  computed: {
    entry() {
      return this.leaderboard[this.selected];
    },
  },
  async mounted() {
    try {
      // Fetch packs
      const packsRes = await fetch("/data/packs.json");
      this.packs = await packsRes.json();

      const [leaderboard, err] = await fetchLeaderboard();
      this.leaderboard = leaderboard || [];
      this.err = err || [];

      // Calculate pack bonuses
      this.leaderboard.forEach((player) => {
        let bonusTotal = 0;
        player.completedPacks = [];

        this.packs.forEach((pack) => {
          const allCompleted = pack.levels.every((lvl) =>
            player.completed.includes(lvl) || player.verified.includes(lvl)
          );
          if (allCompleted) {
            bonusTotal += pack.bonusPoints;
            player.completedPacks.push({
              name: pack.name,
              points: pack.bonusPoints,
            });
          }
        });

        player.total += bonusTotal;
      });

      // Re-sort leaderboard by total points
      this.leaderboard.sort((a, b) => b.total - a.total);

    } catch (e) {
      console.error(e);
      this.leaderboard = [];
      this.err = ["Failed to load leaderboard"];
    } finally {
      this.loading = false;
    }
  },
  methods: { localize },
  template: `
    <main v-if="loading"><Spinner /></main>
    <main v-else class="page-leaderboard-container">
      <div class="page-leaderboard">
        <table class="board">
          <tr v-for="(p,i) in leaderboard" :key="p.user">
            <td class="rank">#{{ i + 1 }}</td>
            <td class="total">{{ localize(p.total) }}</td>
            <td class="user">{{ p.user }}</td>
          </tr>
        </table>

        <div v-if="entry" class="player-profile">
          <h1 class="player-name">{{ entry.user }} - Total: {{ localize(entry.total) }}</h1>

          <div v-if="entry.verified.length || entry.completed.length">
            <h2>Levels Completed / Verified</h2>
            <ul>
              <li v-for="lvl in entry.verified" :key="lvl">
                {{ lvl }} (Verified)
              </li>
              <li v-for="lvl in entry.completed" :key="lvl">
                {{ lvl }} (Completed)
              </li>
            </ul>
          </div>

          <div v-if="entry.completedPacks.length">
            <h2>Completed Packs</h2>
            <ul>
              <li v-for="pack in entry.completedPacks" :key="pack.name">
                {{ pack.name }} (+{{ pack.points }} pts)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  `,
};
