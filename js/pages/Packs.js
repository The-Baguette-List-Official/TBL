// /js/pages/Packs.js
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
    // Collect all unique level filenames from packs
    const allFiles = Array.from(new Set(this.packs.flatMap(p => p.levelFileNames)));

    for (const fileName of allFiles) {
      try {
        const resp = await fetch(`/data/${fileName}.json`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        this.levelsData[fileName] = json;
        console.log("Loaded level:", fileName, json);
      } catch (err) {
        console.warn(`Failed to load /data/${fileName}.json`, err);
      }
    }

    this.loading = false;
  },
  methods: {
    getLevelData(fileName) {
      return this.levelsData[fileName] || null;
    },
    getEmbedUrl(url) {
      if (!url) return null;
      const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/
      );
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return null;
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
              <span v-if="getLevelData(file)">
                {{ getLevelData(file).name }}
              </span>
              <span v-else>
                (missing level: {{ file }})
              </span>
            </li>
          </ul>

          <div class="videos">
            <div
              v-for="file in pack.levelFileNames"
              :key="file + '-vid'"
              v-if="getEmbedUrl(getLevelData(file)?.video)"
              class="video-frame"
            >
              <iframe
                width="100%"
                height="180"
                :src="getEmbedUrl(getLevelData(file).video)"
                frameborder="0"
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
