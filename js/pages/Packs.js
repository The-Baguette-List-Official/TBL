export default {
  name: "Packs",
  data() {
    return {
      list: [], // will hold the JSON data
      packs: [
        { name: "The Former Top 1's", levelIndices: [4, 12, 15], bonusPoints: 150 },
      ],
      loading: true,
    };
  },
  async created() {
    try {
      const res = await fetch("/data/list.json"); // your list.json path
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.list = await res.json();
      console.log("Loaded list.json", this.list);
    } catch (e) {
      console.error("Failed to load list.json", e);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    getLevel(index) {
      return this.list[index] || { name: "Unknown", link: null };
    },
    getEmbedUrl(url) {
      if (!url) return null;
      const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
      const long = url.match(/v=([A-Za-z0-9_-]{11})/);
      const embed = url.match(/embed\/([A-Za-z0-9_-]{11})/);
      const id = short?.[1] || long?.[1] || embed?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    },
  },
  template: `
    <div id="tab-packs" class="packs-grid">
      <div v-if="loading">Loading packs...</div>
      <div v-else>
        <div v-for="pack in packs" :key="pack.name" class="pack-card">
          <h3>{{ pack.name }}</h3>
          <ul>
            <li v-for="i in pack.levelIndices" :key="i">{{ getLevel(i).name }}</li>
          </ul>
          <div class="videos">
            <div v-for="i in pack.levelIndices" :key="i+'-vid'" v-if="getEmbedUrl(getLevel(i).link)" class="video-frame">
              <iframe
                width="100%"
                height="180"
                :src="getEmbedUrl(getLevel(i).link)"
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
