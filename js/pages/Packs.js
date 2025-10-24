export default {
  name: "Packs",
  props: ["username"], // pass the current username
  data() {
    return {
      list: [],   // all levels { name, link, scores }
      packs: [],  // custom packs
      loading: true
    };
  },
  async created() {
    try {
      const res = await fetch("/data/_list.json");
      const levelNames = await res.json();

      const promises = levelNames.map(name =>
        fetch(`/data/${name}.json`)
          .then(r => r.json())
          .catch(err => {
            console.warn("Failed to fetch level:", name, err);
            return null;
          })
      );

      const results = await Promise.allSettled(promises);
      this.list = results
        .filter(r => r.status === "fulfilled" && r.value)
        .map(l => ({
          name: l.value.name,
          normalizedName: l.value.name.replace(/-/g, " ").trim().toLowerCase(),
          link: l.value.link,
          scores: l.value.scores || []
        }));

      this.packs = [
        {
          name: "The Former Top 1's",
          levels: ["colorblind", "champions road", "my spike is laggy"],
          bonusPoints: 150
        },
        {
          name: "Full Pack",
          levels: this.list.map(l => l.name),
          bonusPoints: 100
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
    userCompletedPack(pack) {
      if (!this.username) return false;
      return pack.levels.every(levelName => {
        const level = this.getLevelByName(levelName);
        return level.scores.some(s => s.name === this.username);
      });
    },
    getUserBonus(pack) {
      return this.userCompletedPack(pack) ? pack.bonusPoints : 0;
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
        <p v-if="userCompletedPack(pack)" class="bonus">
          Completed! +{{ pack.bonusPoints }} pts
        </p>
        <p v-else class="bonus">
          Bonus: +{{ pack.bonusPoints }} pts (incomplete)
        </p>
      </div>
    </div>
  `
};
