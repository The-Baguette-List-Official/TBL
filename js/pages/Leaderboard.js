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
    packs: [],
  }),

  template: `
    <main v-if="loading">
      <Spinner></Spinner>
    </main>

    <main v-else class="page-leaderboard-container">
      <div class="page-leaderboard">
        <div class="error-container" v-if="err.length > 0">
          <p class="error">
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
            <h3>{{ localize(entry.total) }} pts total</h3>

            <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length }})</h2>
            <table class="table" v-if="entry.verified.length > 0">
              <tr v-for="score in entry.verified" :key="score.level">
                <td class="rank"><p>#{{ score.rank }}</p></td>
                <td class="level">
                  <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                </td>
                <td class="score"><p>+{{ localize(score.score) }}</p></td>
              </tr>
            </table>

            <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
            <table class="table" v-if="entry.completed.length > 0">
              <tr v-for="score in entry.completed" :key="score.level">
                <td class="rank"><p>#{{ score.rank }}</p></td>
                <td class="level">
                  <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                </td>
                <td class="score"><p>+{{ localize(score.score) }}</p></td>
              </tr>
            </table>

            <!-- 🟩 Show Pack Bonuses -->
            <div v-if="entry.completedPacks && entry.completedPacks.length > 0" class="bonus-section">
              <h2>Packs Completed</h2>
              <ul>
                <li v-for="pack in entry.completedPacks" :key="pack.name">
                  ✅ Completed <strong>{{ pack.name }}</strong> Pack
                  <span class="bonus-text">(+{{ pack.bonusPoints }} pts)</span>
                </li>
              </ul>
            </div>

            <h2 v-if="entry.progressed.length > 0">Progressed ({{ entry.progressed.length }})</h2>
            <table class="table" v-if="entry.progressed.length > 0">
              <tr v-for="score in entry.progressed" :key="score.level">
                <td class="rank"><p>#{{ score.rank }}</p></td>
                <td class="level">
                  <a class="type-label-lg" target="_blank" :href="score.link">
                    {{ score.percent }}% {{ score.level }}
                  </a>
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
      // Get leaderboard
      const [leaderboardData, err] = await fetchLeaderboard();

      // Get packs (if you don’t have packs.json, it’ll fall back to your Packs.js definition)
      let packs = [];
      try {
        const packsRes = await fetch('/data/packs.json');
        if (packsRes.ok) packs = await packsRes.json();
      } catch {
        console.warn('No packs.json found, skipping external pack load.');
      }

      // 🔹 Normalize helper: lower, replace dashes/spaces
      const normalize = name =>
        name.toLowerCase().replace(/[-\s]+/g, '');

      const updatedLeaderboard = leaderboardData.map(player => {
        const completedLevels = new Set(
          player.completed.map(l => normalize(l.level))
        );

        let bonus = 0;
        const completedPacks = [];

        for (const pack of packs) {
          const allCompleted = pack.levels.every(
            lvl => completedLevels.has(normalize(lvl))
          );

          if (allCompleted) {
            bonus += pack.bonusPoints;
            completedPacks.push(pack);
          }
        }

        return {
          ...player,
          total: player.total + bonus,
          completedPacks,
        };
      });

      // Sort by total points (including bonus)
      updatedLeaderboard.sort((a, b) => b.total - a.total);

      this.leaderboard = updatedLeaderboard;
      this.packs = packs;
      this.err = err || [];
    } catch (e) {
      console.error("Error fetching leaderboard or packs:", e);
      this.leaderboard = [];
      this.err = ["Could not fetch leaderboard"];
    } finally {
      this.loading = false;
    }
  },

  methods: { localize },
};