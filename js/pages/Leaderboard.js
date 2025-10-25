import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';
import packsData from '../data/packs.json'; // Import your packs data here

export default {
  components: { Spinner },
  data: () => ({
    leaderboard: [],
    loading: true,
    selected: 0,
    err: [],
  }),
  template: `
    <main v-if="loading">
      <Spinner></Spinner>
    </main>
    <main v-else class="page-leaderboard-container">
      <div class="page-leaderboard">
        <div class="error-container">
          <p class="error" v-if="err.length">
            Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
          </p>
        </div>

        <div class="board-container">
          <table class="board">
            <tr v-for="(ientry, i) in leaderboard" :key="ientry.user">
              <td class="rank">
                <p class="type-label-lg">#{{ i + 1 }}</p>
              </td>
              <td class="total">
                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
              </td>
              <td class="user" :class="{ 'active': selected == i }">
                <button @click="selected = i">
                  <span class="type-label-lg">{{ ientry.user }}</span>
                </button>
              </td>
            </tr>
          </table>
        </div>

        <div class="player-container" v-if="entry">
          <div class="player">
            <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
            <h3>Total Points: {{ entry.total }}</h3>

            <h2 v-if="entry.verified.length">Verified ({{ entry.verified.length }})</h2>
            <table class="table" v-if="entry.verified.length">
              <tr v-for="score in entry.verified" :key="score.level">
                <td class="rank"><p>#{{ score.rank }}</p></td>
                <td class="level">
                  <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                </td>
                <td class="score"><p>+{{ localize(score.score) }}</p></td>
              </tr>
            </table>

            <h2 v-if="entry.completed.length">Completed ({{ entry.completed.length }})</h2>
            <table class="table" v-if="entry.completed.length">
              <tr v-for="score in entry.completed" :key="score.level">
                <td class="rank"><p>#{{ score.rank }}</p></td>
                <td class="level">
                  <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                </td>
                <td class="score"><p>+{{ localize(score.score) }}</p></td>
              </tr>
            </table>

            <!-- Completed Packs Section -->
            <h2 v-if="entry.completedPacks.length">Completed Packs</h2>
            <table class="table" v-if="entry.completedPacks.length">
              <tr v-for="pack in entry.completedPacks" :key="pack.name">
                <td class="level">
                  <span class="type-label-lg">{{ pack.name }}</span>
                </td>
                <td class="score">
                  <span class="type-label-lg">+{{ localize(pack.bonusPoints) }}</span>
                </td>
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
    },
  },
  methods: {
    localize,
    calculateCompletedPacks(player) {
      const completedPacks = [];

      for (const pack of packsData) {
        const allLevelsCompleted = pack.levels.every(level =>
          player.completed.some(c => c.level.toLowerCase() === level.toLowerCase())
        );
        if (allLevelsCompleted) {
          completedPacks.push({
            name: pack.name,
            bonusPoints: pack.bonusPoints,
          });
        }
      }

      return completedPacks;
    },
  },
  async mounted() {
    try {
      const [leaderboard, err] = await fetchLeaderboard();
      this.err = err || [];
      if (!leaderboard) {
        this.leaderboard = [];
        this.loading = false;
        return;
      }

      // Add completed packs and total points
      this.leaderboard = leaderboard.map(player => {
        const completedPacks = this.calculateCompletedPacks(player);
        const bonusPoints = completedPacks.reduce((sum, p) => sum + p.bonusPoints, 0);
        return {
          ...player,
          completedPacks,
          total: player.total + bonusPoints,
        };
      });

      // Sort leaderboard by total points descending
      this.leaderboard.sort((a, b) => b.total - a.total);

    } catch (e) {
      console.error("Error fetching leaderboard:", e);
      this.leaderboard = [];
      this.err.push("Could not fetch leaderboard");
    } finally {
      this.loading = false;
    }
  },
};