import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';
import packs from '../data/packs.json'; // make sure this path is correct

export default {
  components: { Spinner },
  data: () => ({
    leaderboard: [],
    loading: true,
    selected: 0,
    err: [],
    packs: packs || [],
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

        <div class="player-container" v-if="entry">
          <div class="player">
            <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
            <h3>Total points: {{ entry.total }}</h3>

            <div v-if="entry.completedPacks && entry.completedPacks.length > 0" class="completed-packs">
              <h2>Completed Packs</h2>
              <table class="table">
                <tr v-for="packName in entry.completedPacks" :key="packName">
                  <td class="pack-name type-label-lg">{{ packName }}</td>
                  <td class="pack-points type-label-lg">
                    +{{ localize(getPackPoints(packName)) }}
                  </td>
                </tr>
              </table>
            </div>

            <h2 v-if="entry.verified.length > 0">Verified Levels ({{ entry.verified.length }})</h2>
            <table class="table" v-if="entry.verified.length > 0">
              <tr v-for="score in entry.verified" :key="score.level">
                <td class="rank"><p>#{{ score.rank }}</p></td>
                <td class="level">
                  <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                </td>
                <td class="score"><p>+{{ localize(score.score) }}</p></td>
              </tr>
            </table>

            <h2 v-if="entry.completed.length > 0">Completed Levels ({{ entry.completed.length }})</h2>
            <table class="table" v-if="entry.completed.length > 0">
              <tr v-for="score in entry.completed" :key="score.level">
                <td class="rank"><p>#{{ score.rank }}</p></td>
                <td class="level">
                  <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                </td>
                <td class="score"><p>+{{ localize(score.score) }}</p></td>
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
  async mounted() {
    try {
      const [leaderboard, err] = await fetchLeaderboard();
      this.err = err || [];
      if (!leaderboard) return;

      // Normalization function to compare levels
      const normalize = (str) => str.toLowerCase().replace(/[\s\-']/g, "");

      // Loop through each player and calculate pack bonuses
      this.leaderboard = leaderboard.map((player) => {
        let packBonuses = 0;
        player.completedPacks = [];

        this.packs.forEach((pack) => {
          const normalizedPackLevels = pack.levels.map(normalize);
          const completedLevels = player.completed.map((lvl) => normalize(lvl.level));

          const completedPack = normalizedPackLevels.every((lvl) => completedLevels.includes(lvl));

          if (completedPack) {
            packBonuses += pack.bonusPoints;
            player.completedPacks.push(pack.name);
          }
        });

        return {
          ...player,
          total: player.total + packBonuses,
          packBonuses,
        };
      });

      // Sort leaderboard by total points descending
      this.leaderboard.sort((a, b) => b.total - a.total);
    } catch (e) {
      console.error("Error fetching leaderboard:", e);
      this.leaderboard = [];
      this.err = ["Could not fetch leaderboard"];
    } finally {
      this.loading = false;
    }
  },
  methods: {
    localize,
    getPackPoints(packName) {
      const pack = this.packs.find((p) => p.name === packName);
      return pack ? pack.bonusPoints : 0;
    },
  },
};