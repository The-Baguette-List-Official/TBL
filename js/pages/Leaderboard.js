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
              <td class="rank">
                <p class="type-label-lg">#{{ i + 1 }}</p>
              </td>
              <td class="total">
                <p class="type-label-lg">{{ localize(ientry.total) }}<span v-if="ientry.packBonuses"> (+{{ ientry.packBonuses }})</span></p>
              </td>
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
            <h3>{{ entry.total }}</h3>

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
    // Fetch leaderboard as usual
    const [leaderboard, err] = await fetchLeaderboard();
    this.leaderboard = leaderboard || [];
    this.err = err || [];

    // Fetch packs.json
    const res = await fetch("/data/packs.json");
    const packs = await res.json();

    // Fetch each level JSON to find verified users
    for (const pack of packs) {
      const completedBy = new Set();

      for (const levelName of pack.levels) {
        const levelPath = `/data/${levelName}.json`;
        const levelRes = await fetch(levelPath);
        if (!levelRes.ok) continue;

        const levelData = await levelRes.json();

        if (levelData && levelData.records) {
          // Check who completed (100%) the level
          levelData.records
            .filter((r) => r.percent === 100)
            .forEach((r) => completedBy.add(r.user));
        }
      }

      // Apply bonus points to players who completed all levels in the pack
      this.leaderboard = this.leaderboard.map((player) => {
        if ([...completedBy].includes(player.user)) {
          player.total += pack.bonusPoints;
          player.packBonus = (player.packBonus || 0) + pack.bonusPoints;
        }
        return player;
      });
    }
  } catch (e) {
    console.error("Error fetching leaderboard or packs:", e);
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