// /js/pages/Packs.js

export default {
  name: "Packs",
  data() {
    return {
      // Define packs by pointing to JSON filenames (without extension) for levels
      packs: [
        {
          name: "Starter Pack",
          levelFileNames: ["Colorblind", "Champions-Road", "My-spike-is-laggy"],
          bonusPoints: 150,
        },
      ],
      levelsData: {},  // will hold loaded JSON data by filename
    };
  },
  async created() {
    // Pre-load all levels referenced in packs
    const allFiles = Array.from(new Set(this.packs.flatMap(p => p.levelFileNames)));
    await Promise.all(allFiles.map(async fileName => {
      try {
        const resp = await fetch(`/data/${fileName}.json`);
        const json = await resp.json();
        this.levelsData[fileName] = json;
      } catch (err) {
        console.warn(`Failed to load level data ${fileName}.json`, err);
      }
    }));
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
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    },
  },
  template: `
    <div id="tab-packs" class="packs-grid">
      <div v-for="pack in packs" :key="pack.name" class="pack-card">
        <h3>{{ pack.name }}</h3>
        
        <ul>
          <li v-for="file in pack.levelFileNames" :key="file">
            <span v-if="getLevelData(file)">
              {{ getLevelData(file).name }}
            </span>
            <span v-else>
              (level data unavailable)
            </span>
          </li>
        </ul>
        
        <div class="videos">
          <div
            v-for="file in pack.levelFileNames"
            :key="file"
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
  `,
};
