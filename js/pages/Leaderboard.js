import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';
import * as packsModule from '../packs.js';

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
                <p class="type-label-lg">
                  {{ localize(ientry.total) }}
                  <span v-if="ientry.packBonuses && Number(ientry.packBonuses) > 0" class="pack-bonus">(+{{ localize(ientry.packBonuses) }})</span>
                </p>
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
            <h3>{{ localize(entry.total) }}</h3>
            <p v-if="entry.packBonuses && Number(entry.packBonuses) > 0" class="type-label-sm pack-bonus">Pack bonus: +{{ localize(entry.packBonuses) }}</p>

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
      const [leaderboard, err] = await fetchLeaderboard();
      this.leaderboard = leaderboard || [];
      this.err = err || [];

      // Prefer packs component on the root if available, otherwise fall back to the repository's packs export.
      const packsComponent = this.$root && this.$root.$refs && this.$root.$refs.packsComponent;
      let packsSource = null;

      if (packsComponent && packsComponent.packs && packsComponent.levelData) {
        packsSource = { packs: packsComponent.packs, levelData: packsComponent.levelData };
      } else if (packsModule) {
        // Try to handle both named exports and default export shapes
        const candidate = packsModule.packs ? packsModule : (packsModule.default ? packsModule.default : null);
        if (candidate && candidate.packs && candidate.levelData) {
          packsSource = { packs: candidate.packs, levelData: candidate.levelData };
        }
      }

      if (packsSource) {
        const { packs, levelData } = packsSource;

        // Helper to slugify a level name to the common key forms used by levelData
        const slugify = (s) =>
          String(s || '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9\-]/g, '')
            .toLowerCase();

        const findLevelData = (raw) => {
          const attempts = [];
          if (typeof raw === 'string') attempts.push(raw);
          if (raw && raw.name) attempts.push(raw.name);
          attempts.push(slugify(raw));
          if (typeof raw === 'string') attempts.push(raw.replace(/\s+/g, '-'));
          // also try direct keys from levelData object
          for (const key of attempts) {
            if (!key) continue;
            if (levelData[key]) return levelData[key];
          }
          // nothing found
          return undefined;
        };

        // Normalize leaderboard usernames to lowercase for reliable comparison, but keep original user string for display.
        this.leaderboard = this.leaderboard.map(player => ({ ...player, _normUser: String(player.user || '').toLowerCase() }));

        this.leaderboard = this.leaderboard.map(player => {
          let totalBonus = 0;

          (Array.isArray(packs) ? packs : []).forEach(pack => {
            const bonus = Number(pack.bonusPoints || 0);

            // pack.levels might be array of strings or objects
            const levels = Array.isArray(pack.levels) ? pack.levels : [];

            const completedAll = levels.length > 0 && levels.every(levelEntry => {
              const levelDatum = findLevelData(levelEntry);
              if (!levelDatum || !levelDatum.verification) return false;

              // verification is assumed to be an array of usernames (strings).
              // Normalize them when checking to be case-insensitive.
              const verifiedUsers = (levelDatum.verification || []).map(u => String(u).toLowerCase());
              return verifiedUsers.includes(player._normUser);
            });

            if (completedAll && bonus) totalBonus += bonus;
          });

          return {
            ...player,
            total: (Number(player.total) || 0) + totalBonus,
            packBonuses: totalBonus,
          };
        });

        // Remove temporary normalization property and sort leaderboard by total descending
        this.leaderboard.sort((a, b) => (b.total || 0) - (a.total || 0));
        this.leaderboard = this.leaderboard.map(({ _normUser, ...rest }) => rest);
      }

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
  },
};
