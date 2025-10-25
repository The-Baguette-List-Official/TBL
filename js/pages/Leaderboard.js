import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
  components: {
    Spinner,
  },
  data: () => ({
    leaderboard: [],
    loading: true,
    selected: 0,
    err: [],
    packs: [], // loaded dynamically
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

            <div v-if="entry.completedPacks && entry.completedPacks.length > 0" class="completed-packs">
              <h2>Completed Packs</h2>
              <ul>
                <li v-for="pack in entry.completedPacks" :key="pack.name">
                  {{ pack.name }} (+{{ pack.bonusPoints }} pts)
                </li>
              </ul>
            </div>

            <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length }})</h2>
            <table class="table" v-if="entry.verified.length > 0">
              <tr v-for="score in entry.verified" :key="score.level">
                <td class="rank"><p>#{{ score.rank }}</p></td>
                <td class="level"><a class="type-label-lg" target="_blank" :href="score.verification || score.link">{{ score.level }}</a></td>
                <td class="score"><p>+{{ localize(score.score) }}</p></td>
              </tr>
            </table>

            <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
            <table class="table" v-if="entry.completed.length > 0">
              <tr v-for="score in entry.completed" :key="score.level">
                <td class="rank"><p>#{{ score.rank }}</p></td>
                <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
                <td class="score"><p>+{{ localize(score.score) }}</p></td>
              </tr>
            </table>

            <h2 v-if="entry.progressed.length > 0">Progressed ({{ entry.progressed.length }})</h2>
            <table class="table" v-if="entry.progressed.length > 0">
              <tr v-for="score in entry.progressed" :key="score.level">
                <td class="rank"><p>#{{ score.rank }}</p></td>
                <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a></td>
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

      // Fetch packs from packs.json
      const packsRes = await fetch("/data/packs.json");
      if (packsRes.ok) {
        this.packs = await packsRes.json();
      } else {
        console.warn("Failed to load packs.json");
        this.packs = [];
      }

      // Normalize level names for comparison
      const normalize = (str) => str.toLowerCase().replace(/\s|-/g, "");

      // Apply pack bonuses
      for (const player of leaderboard) {
        const allDoneLevels = [
          ...(player.completed || []),
          ...(player.verified || []),
        ].filter(l => l.link || l.verification);

        const completedLevelNames = new Set(allDoneLevels.map(l => normalize(l.level)));

        player.completedPacks = [];
        let bonusTotal = 0;

        for (const pack of this.packs) {
          const allCompleted = pack.levels.every(level =>
            completedLevelNames.has(normalize(level))
          );

          if (allCompleted) {
            player.completedPacks.push(pack);
            bonusTotal += pack.bonusPoints;
          }
        }

        player.total = (player.total || 0) + bonusTotal;
        player.packBonus = bonusTotal;
      }

      // Re-sort leaderboard after applying bonuses
      this.leaderboard = leaderboard.sort((a, b) => b.total - a.total);
    } catch (e) {
      console.error("Error loading leaderboard or packs:", e);
      this.leaderboard = [];
      this.err = ["Could not fetch leaderboard or packs"];
    } finally {
      this.loading = false;
    }
  },
  methods: {
    localize,
  },
};