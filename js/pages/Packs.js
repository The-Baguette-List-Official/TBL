export default {
  name: "Packs",
  data() {
    return {
      list: [],
      packs: [],
      loading: true,
    };
  },
  async created() {
    try {
      const res = await fetch("/data/_list.json");
      const levelNames = await res.json();

      const fetchPromises = levelNames.map(name =>
        fetch(`/data/${encodeURIComponent(name)}.json`)
          .then(r => r.json())
          .catch(() => null)
      );

      const results = await Promise.allSettled(fetchPromises);

      this.list = results
        .filter(r => r.status === "fulfilled" && r.value)
        .map(l => ({
          name: l.value.name,
          normalizedName: l.value.name.replace(/-/g, " ").trim().toLowerCase(),
          link: l.value.link,
          scores: l.value.scores || [] // already in the JSON
        }));

      // Example packs
      this.packs = [
        {
          name: "The Former Top 1's",
          levels: ["Colorblind", "Champions-Road", "My-Spike-is-Laggy"],
          bonusPoints: 150,
        }
      ];
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    getLevelByName(name) {
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
    // Check which users have completed a pack
    getUsersCompletedPack(pack) {
      const usersPerLevel = pack.levels.map(levelName => {
        const level = this.getLevelByName(levelName);
        return level.scores.map(s => s.name); // array of users
      });
      if (usersPerLevel.length === 0) return [];
      // intersection of all arrays → users who appear in every level
      return usersPerLevel.reduce((a, b) => a.filter(c => b.includes(c)));
    },
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
  `,
};
