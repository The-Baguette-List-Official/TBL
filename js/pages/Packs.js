export default {
  name: "Packs",
  data() {
    return {
      list: [],   // all levels loaded from _list.json
      packs: [],  // predefined packs
      loading: true
    };
  },
  async created() {
    try {
      const res = await fetch("/data/_list.json");
      if (!res.ok) throw new Error("_list.json not found");
      const levelNames = await res.json();

      const fetchPromises = levelNames.map(name =>
        fetch(`/data/${encodeURIComponent(name)}.json`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      );

      const results = await Promise.all(fetchPromises);

      this.list = results
        .filter(l => l) // remove nulls
        .map(l => ({
          name: l.name || "Unknown",
          normalizedName: (l.name || "Unknown").replace(/-/g, " ").trim().toLowerCase(),
          link: l.link || null,
          scores: l.scores || []
        }));

      // Example packs
      this.packs = [
        {
          name: "The Former Top 1's",
          levels: ["Colorblind", "Champions-Road", "My-Spike-is-Laggy"],
          bonusPoints: 150
        }
      ];

    } catch (err) {
      console.error("Error loading packs:", err);
    } finally {
      this.loading = false; // ✅ ensures it doesn’t get stuck
    }
  },
  methods: {
    getLevelByName(name) {
      if (!this.list.length) return { name: "Unknown", link: null, scores: [] };
      const normalized = name.replace(/-/g, " ").trim().toLowerCase();
      return this.list.find(l => l.normalizedName === normalized) || { name: "Unknown", link: null, scores: [] };
    },
    getEmbedUrl(url) {
      if (!url) return null;
      const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
      const long = url.match(/v=([A-Za-z0-9_-]{11})/);
      const embed = url.match(/embed\/([A-Za-z0-9_-]{11})/);
      const id = short?.[1] || long?.[1] || embed?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    },
    getUsersCompletedPack(pack) {
      if (!this.list.length) return [];
      const usersPerLevel = pack.levels.map(levelName => {
        const level = this.getLevelByName(levelName);
        return level.scores.map(s => s.name);
      });
      if (!usersPerLevel.length) return [];
      return usersPerLevel.reduce((a, b) => a.filter(c => b.includes(c)));
    }
  },
  template: `
    <div v-if="loading" class="roulette-background">Loading packs...</div>
    <div v-else id="tab-packs" class="packs-grid roulette-background">
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
        <p class="bonus">
          Completed by: {{ getUsersCompletedPack(pack).join(', ') || 'None' }}<br>
          Bonus: +{{ pack.bonusPoints }} pts
        </p>
      </div>
    </div>
  `
};
