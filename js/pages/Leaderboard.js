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
    packs: [] // populate from packs.js
  }),
  template: `
    <main v-if="loading"><Spinner></Spinner></main>
    <main v-else class="page-leaderboard-container">
      <div class="page-leaderboard">
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

            <div v-for="pack in entry.completedPacks" class="completed-pack" :key="pack.name">
              <p>{{ pack.name }} completed (+{{ pack.bonusPoints }} pts)</p>
            </div>
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

      // Get packs dynamically from packs.js
      const packsModule = await import('./Packs.js');
      this.packs = packsModule.default.data().packs;

      // Apply pack bonus points
      this.leaderboard.forEach(player => {
        const completedPacks = [];

        this.packs.forEach(pack => {
          const normalize = str => str.toLowerCase().replace(/[\s\-']/g, "");
          const playerCompleted = player.completed.map(lvl => normalize(lvl));
          const packLevels = pack.levels.map(lvl => normalize(lvl.display));

          const finished = packLevels.every(lvl => playerCompleted.includes(lvl));
          if (finished) {
            player.total += pack.bonusPoints;
            completedPacks.push({ name: pack.name, bonusPoints: pack.bonusPoints });
          }
        });

        player.completedPacks = completedPacks;
      });

      // Re-sort leaderboard by total points descending
      this.leaderboard.sort((a, b) => b.total - a.total);

    } catch (e) {
      console.error("Leaderboard error:", e);
      this.leaderboard = [];
      this.err = ["Could not fetch leaderboard"];
    } finally {
      this.loading = false;
    }
  },
  methods: { localize }
};