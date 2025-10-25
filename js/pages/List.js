export default {
  name: "Packs",
  data() {
    return {
      packs: [
        {
          name: "The Former Top 1's",
          bonusPoints: 200,
          levels: [
            { file: "Colorblind", display: "Colorblind" },
            { file: "Champions-Road", display: "Champion's Road" },
            { file: "Bobsawamba", display: "Bobsawamba" },
            { file: "My-Spike-is-Laggy", display: "My Spike is Laggy" }
          ]
        }
      ],
      loading: true,
      error: null
    };
  },

  async mounted() {
    try {
      for (const pack of this.packs) {
        const fetchedLevels = [];
        for (const lvl of pack.levels) {
          const res = await fetch(`/data/${lvl.file}.json`);
          if (!res.ok) continue;

          const data = await res.json();
          const ytUrl = data.verification?.[0] || null;
          const embedUrl = ytUrl ? this.convertToEmbed(ytUrl) : null;

          fetchedLevels.push({
            name: lvl.display,
            embedUrl
          });
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
      const ytMatch = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
      );
      return ytMatch?.[1] ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
    }
  },

  template: `
    <main v-if="loading" class="page-packs-container">
      <p class="type-label-lg">Loading packs...</p>
    </main>
    <main v-else class="page-packs-container">
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
    </main>
  `
};