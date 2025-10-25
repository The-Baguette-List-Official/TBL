export default {
  name: "Packs",
  data() {
    return {
      packs: [],
      levelData: {}, // For leaderboard bonus calculation
      loading: true,
      error: null,
    };
  },

  async mounted() {
    try {
      const res = await fetch("/data/packs.json");
      if (!res.ok) throw new Error("Failed to fetch packs.json");
      const packsList = await res.json();

      for (const pack of packsList) {
        const fetchedLevels = [];

        for (const levelName of pack.levels) {
          // Convert level name to file name: spaces → dashes
          const fileName = levelName.replace(/ /g, "-");
          const levelPath = `/data/${fileName}.json`;

          try {
            const levelRes = await fetch(levelPath);
            if (!levelRes.ok) throw new Error(`Failed to fetch ${levelPath}`);
            const data = await levelRes.json();

            // Store verification/completed links
            this.levelData[levelName] = {
              verification: data.verification || [],
              link: data.link || [],
            };

            // Convert first completed link to YouTube embed
            const ytUrl = Array.isArray(data.link) ? data.link[0] : data.link;
            const embedUrl = ytUrl ? this.convertToEmbed(ytUrl) : null;

            fetchedLevels.push({
              name: levelName, // keep original with spaces/apostrophes
              embedUrl,
            });
          } catch (err) {
            console.warn("Could not load level", levelName, err);
            fetchedLevels.push({ name: levelName, embedUrl: null });
          }
        }

        pack.levels = fetchedLevels;
      }

      this.packs = packsList;
      this.loading = false;
    } catch (err) {
      console.error(err);
      this.error = err.message;
      this.loading = false;
    }
  },

  methods: {
    convertToEmbed(url) {
      if (!url) return null;
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    },
  },

  template: `
    <main v-if="loading" class="page-packs-container">
      <p class="type-label-lg">Loading packs...</p>
    </main>

    <main v-else class="page-packs-container">
      <div v-for="pack in packs" :key="pack.name" class="pack">
        <h2 class="pack-title">{{ pack.name }} (+{{ pack.bonusPoints }} pts)</h2>
        <div class="pack-levels">
          <div v-for="level in pack.levels" :key="level.name" class="pack-level">
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
    </main>
  `,
};
