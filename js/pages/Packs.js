export default {
  name: "Packs",
  data() {
    return {
      packs: [],
      loading: true,
      error: null,
    };
  },

  async mounted() {
    try {
      // Fetch pack definitions
      const res = await fetch("/data/packs.json");
      if (!res.ok) throw new Error("Failed to load packs.json");
      const packs = await res.json();

      // For each pack, fetch level data
      for (const pack of packs) {
        const fetchedLevels = [];

        for (const levelName of pack.levels) {
          const levelPath = `/data/${levelName}.json`;

          try {
            const res = await fetch(levelPath);
            if (!res.ok) continue;

            const data = await res.json();

            // Convert dashes to spaces for display
            const displayName = levelName.replace(/-/g, " ");

            // Use verification link(s) to create YouTube embeds
            const verification = data.verification;
            let embedUrl = null;

            if (Array.isArray(verification) && verification.length > 0) {
              embedUrl = this.convertToEmbed(verification[0]);
            } else if (typeof verification === "string") {
              embedUrl = this.convertToEmbed(verification);
            }

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

      this.packs = packs;
      this.loading = false;
    } catch (err) {
      this.error = err.message;
      this.loading = false;
    }
  },

  methods: {
    // Converts full YouTube URLs to embed format
    convertToEmbed(url) {
      if (!url) return null;

      const ytMatch = url.match(
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