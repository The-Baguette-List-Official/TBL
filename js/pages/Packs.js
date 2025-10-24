export default {
  name: "Packs",
  data() {
    return {
      list: [],   // all levels { name, link }
      packs: [],  // custom packs
      loading: true
    };
  },
  async created() {
    try {
      // Fetch _list.json (array of level filenames)
      const res = await fetch("/data/_list.json");
      const levelNames = await res.json();
      
      // Fetch all level JSONs
      const promises = levelNames.map(name =>
        fetch(`/data/${name}.json`).then(r => r.json())
      );
      const levels = await Promise.all(promises);
      
      // Store levels in list
      this.list = levels.map(l => ({
        name: l.name,
        link: l.link
      }));

      // Define custom packs by level names
      this.packs = [
        {
          name: "The Former Top 1's",
          levels: ["Colorblind", "Champions Road", "My Spike is Laggy"],
          bonusPoints: 150
        }
      ];

    } catch (err) {
      console.error("Error fetching level data:", err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    getLevelByName(name) {
      return this.list.find(l => l.name === name) || { name: "Unknown", link: null };
    },
    getEmbedUrl(url) {
      if (!url) return null;
      const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
      const long = url.match(/v=([A-Za-z0-9_-]{11})/);
      const embed = url.match(/embed\/([A-Za-z0-9_-]{11})/);
      const id = short?.[1] || long?.[1] || embed?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  },
  template: `
    <div v-if="loading">Loading packs...</div>
    <div v-else id="tab-packs" class="packs-grid">
      <div v-for="pack in packs" :key="pack.name" class="pack-card">
        <h3>{{ pack.name }}</h3>
        <ul>
          <li v-for="levelName in pack.levels" :key="levelName">
            {{ getLevelByName(levelName).name }}
          </li>
        </ul>
        <div class="videos">
          <div
            v-for="levelName in pack.levels"
            :key="levelName+'-vid'"
            v-if="getEmbedUrl(getLevelByName(levelName).link)"
            class="video-frame"
          >
            <iframe
              width="100%"
              height="180"
              :src="getEmbedUrl(getLevelByName(levelName).link)"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
        <p class="bonus">Bonus: +{{ pack.bonusPoints }} pts</p>
      </div>
    </div>
  `
};