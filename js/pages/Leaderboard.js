import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';

const packs = [
  {
    name: "The Former Top 1's",
    bonusPoints: 200,
    levels: ["Colorblind", "Champions-Road", "Bobsawamba", "My-Spike-is-Laggy"]
  }
];

export default {
  components: { Spinner },
  data: () => ({
    leaderboard: [],
    loading: true,
    selected: 0,
    err: []
  }),
  template: `
    <main v-if="loading">
      <Spinner></Spinner>
    </main>
    <main v-else class="page-leaderboard-container">
      <div class="page-leaderboard">
        <div class="error-container">
          <p class="error" v-if="err.length > 0">
            Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
          </p>
        </div>
        <div class="board-container">
          <table class="board">
            <tr v-for="(ientry, i) in leaderboard" :key="ientry.user">
              <td class="rank"><p class="type-label-lg">#{{ i + 1 }}</p></td>
              <td class="total"><p class="type-label-lg">{{ localize(ientry.total) }}</p></td>
              <td class="user" :class="{ 'active': selected == i }">
                <button @click="selected = i">
                  <span class="type-label-lg">{{ ientry.user }}</span>
                </button>
              </td>
            </tr>
          </table>
        </div>

        <div class="player-container">
          <div class="player" v-if="entry">
            <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
            <h3>Total Points: {{ entry.total }}</h3>

            <div v-if="entry.completedPacks && entry.completedPacks.length > 0">
              <h2>Completed Packs</h2>
              <ul>
                <li v-for="pack in entry.completedPacks" :key="pack.name" style="display:flex; justify-content: space-between;">
                  <span>{{ pack.name }}</span>
                  <span>+{{ pack.bonusPoints }} pts</span>
                </li>
              </ul>
            </div>

            <h2 v-if="entry.completed.length > 0">Completed Levels</h2>
            <table class="table" v-if="entry.completed.length > 0">
              <tr v-for="lvl in entry.completed" :key="lvl.level">
                <td>{{ lvl.level }}</td>
                <td>+{{ localize(lvl.score) }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </main>
  `,
  computed: {
    entry() {
      return this.leaderboard[this.selected];
    }
  },
  async mounted() {
    try {
      const [leaderboard, err] = await fetchLeaderboard();
      this.leaderboard = leaderboard || [];
      this.err = err || [];

      // Normalize helper
      const normalize = str => str.toLowerCase().replace(/[\s\-']/g, "");

      // Calculate pack bonuses
      this.leaderboard.forEach(player => {
        const completedPacks = [];
        packs.forEach(pack => {
          const playerCompleted = player.completed.map(lvl => normalize(lvl.level));
          const packLevels = pack.levels.map(lvl => normalize(lvl));

          if (packLevels.every(lvl => playerCompleted.includes(lvl))) {
            player.total += pack.bonusPoints;
            completedPacks.push({ name: pack.name, bonusPoints: pack.bonusPoints });
          }
        });
        player.completedPacks = completedPacks;
      });

      // Re-rank leaderboard
      this.leaderboard.sort((a, b) => b.total - a.total);
    } catch (e) {
      console.error("Error fetching leaderboard:", e);
      this.leaderboard = [];
      this.err = ["Could not fetch leaderboard"];
    } finally {
      this.loading = false;
    }
  },
  methods: { localize }
};