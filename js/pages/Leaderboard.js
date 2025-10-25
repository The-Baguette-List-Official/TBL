    loading: true,
    selected: 0,
    err: [],
    packs: [], // store packs for bonus calculation
  }),

  template: `
    <main v-if="loading">
      <Spinner></Spinner>
    </main>

    <main v-else class="page-leaderboard-container">
      <div class="page-leaderboard">
        <div class="error-container">
                <p class="type-label-lg">#{{ i + 1 }}</p>
              </td>
              <td class="total">
                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
              </td>
              <td class="user" :class="{ 'active': selected == i }">
                <button @click="selected = i">
        <div class="player-container">
          <div class="player" v-if="entry">
            <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
            <h3>{{ localize(entry.total) }} pts total</h3>

            <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length }})</h2>
            <table class="table" v-if="entry.verified.length > 0">
              </tr>
            </table>

            <!-- 🟩 Bonus packs section -->
            <div v-if="entry.completedPacks && entry.completedPacks.length > 0" class="bonus-section">
              <h2>Packs Completed</h2>
              <ul>
                <li v-for="pack in entry.completedPacks" :key="pack.name">
                  Completed <strong>{{ pack.name }}</strong> Pack (+{{ pack.bonusPoints }} pts)
                </li>
              </ul>
            </div>

            <h2 v-if="entry.progressed.length > 0">Progressed ({{ entry.progressed.length }})</h2>
            <table class="table" v-if="entry.progressed.length > 0">
              <tr v-for="score in entry.progressed" :key="score.level">
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
      // Fetch both leaderboard and packs
      const [leaderboardData, err] = await fetchLeaderboard();
      const packsRes = await fetch('/data/packs.json');
      const packs = packsRes.ok ? await packsRes.json() : [];

      // Compute pack bonuses for each player
      const updatedLeaderboard = leaderboardData.map(player => {
        const completedLevels = new Set(player.completed.map(l => l.level.replace(/ /g, "-")));

        let bonus = 0;
        const completedPacks = [];

        for (const pack of packs) {
          const allCompleted = pack.levels.every(level =>
            completedLevels.has(level)
          );
          if (allCompleted) {
            bonus += pack.bonusPoints;
            completedPacks.push(pack);
          }
        }

        // Add bonus points to total
        return {
          ...player,
          total: player.total + bonus,
          completedPacks,
        };
      });

      // Re-sort leaderboard by total points descending
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

  methods: {
    localize,
  },
