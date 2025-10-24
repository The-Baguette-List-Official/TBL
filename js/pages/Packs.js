export default {
  name: "Packs",
  data() {
    return {
      packs: [
        {
          name: "The Former Top 1's",
          levelFileNames: ["Colorblind", "Champions-Road", "My-Spike-is-Laggy"],
          bonusPoints: 150,
        },
      ],
      levelsData: {},
      loading: true,
    };
  },
  async created() {
    const allFiles = Array.from(new Set(this.packs.flatMap(p => p.levelFileNames)));
    for (const file of allFiles) {
      try {
        const res = await fetch(`/data/${file}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.levelsData[file] = data;
        console.log(`Loaded ${file}.json`, data);
      } catch (e) {
        console.error(`Error loading ${file}.json`, e);
      }
    }
    this.loading = false;
  },
  methods: {
    getLevel(file) {
      return this.levelsData[file] || {};
    },
    getEmbedUrl(url) {
      if (!url) return null;
      // Support YouTube URL formats
      let videoId = null;
      const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
      const long = url.match(/v=([A-Za-z0-9_-]{11})/);
      const embed = url.match(/embed\/([A-Za-z0-9_-]{11})/);
      if (short) videoId = short[1];
      else if (long) videoId = long[1];
      else if (embed) videoId = embed[1];
      if (!videoId) return null;
      return `https://www.youtube.com/embed/${videoId}`;
    },
  },
  template: `
    <div id="tab-packs" class="packs-grid">
      <div v-if="loading">Loading packs...</div>
      <div v-else>
        <div v-for="pack in packs" :key="pack.name" class="pack-card">
          <h3>{{ pack.name }}</h3>
          <ul>
            <li v-for="file in pack.levelFileNames" :key="file">
              {{ getLevel(file).name || file }}
            </li>
          </ul>

          <div class="videos">
            <div
              v-for="file in pack.levelFileNames"
              :key="file + '-vid'"
              v-if="getEmbedUrl(getLevel(file).link)"
              class="video-frame"
            >
              <iframe
                width="100%"
                height="180"
                :src="getEmbedUrl(getLevel(file).link)"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>

          <p class="bonus">Bonus: +{{ pack.bonusPoints }} pts</p>
        </div>
      </div>
    </div>
  `,
};
