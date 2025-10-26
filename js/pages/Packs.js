export default {
  name: "Packs",
  data() {
    return {
      packs: [
        {
          name: "The Former Top 1's",
          bonusPoints: 200,
          levels: ["Colorblind", "Champions-Road", "Bobsawamba", "My-Spike-is-Laggy"],
        },
        {
          name: "TBL Favorites I",
          bonusPoints: 75,
          levels: ["LgTn", "Fleur-de-lotus", "ARC-EN-CIEL", "Skill-Control", "Frozen-Spike"],
        },
        {
          name: "The Floral Fury Trilogy",
          bonusPoints: 75,
          levels: ["Champions-Road", "The-Moonlit-Pinnacle", "Fleur-de-lotus"],
        }
      ],
      loading: true,
      error: null,
    };
  },

  async mounted() {
    try {
      for (const pack of this.packs) {
        const fetchedLevels = [];

        for (const levelName of pack.levels) {
          const levelPath = `/data/${levelName}.json`;

          try {
            const res = await fetch(levelPath);
            if (!res.ok) continue;

            const data = await res.json();

            const ytUrl = data.verification || null;
            const embedUrl = ytUrl ? this.convertToEmbed(ytUrl) : null;

            const displayName = levelName.replace(/-/g, " ");

            fetchedLevels.push({
              name: displayName,
              embedUrl,
            });
          } catch (err) {
            console.warn(`Failed to load ${levelName}.json`);
          }
        }

        pack.levels = fetchedLevels;
      }
      this.loading = false;
    } catch (err) {
      this.error = err.message;
      this.loading = false;
    }
  },

  methods: {
    convertToEmbed(url) {
      if (!url) return null;

      const ytMatch =
        url.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
        );

      if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
      }
      return null;
    },
  },

  template: `
  <main v-if="loading" class="page-packs-container">
    <p class="type-label-lg">Loading packs...</p>
  </main>

  <main v-else class="page-packs-container">
    <div class="packs-wrapper">
      <div v-for="pack in packs" class="pack">
        <h2 class="pack-title">{{ pack.name }} (+{{ pack.bonusPoints }} pts)</h2>
        <div class="pack-levels">
          <div v-for="level in pack.levels" class="pack-level">
            <h3 class="level-name">{{ level.name }}</h3>
            <iframe
              v-if="level.embedUrl"
              class="level-video"
              :src="level.embedUrl"
              frameborder="0"
              allowfullscreen
            ></iframe>
            <p v-else class="no-video">No verification video found</p>
          </div>
        </div>
      </div>
    </div>
  </main>
`,
};
