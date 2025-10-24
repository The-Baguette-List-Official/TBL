export default {
  name: "Packs",
  props: ["username"], // pass current username
  data() {
    return {
      list: [],       // all successfully loaded levels
      packs: [],      // define your packs here
      loading: true   // controls loading screen
    };
  },
  async created() {
    try {
      // 1️⃣ Fetch the master list of levels
      const res = await fetch("/data/_list.json");
      if (!res.ok) throw new Error("_list.json not found");
      const levelNames = await res.json();

      // 2️⃣ Fetch all level JSONs safely
      const fetchPromises = levelNames.map(name =>
        fetch(`/data/${name}.json`)
          .then(r => {
            if (!r.ok) throw new Error(`Failed to fetch ${name}.json`);
            return r.json();
          })
          .catch(err => {
            console.warn("Level fetch failed:", name, err);
            return null; // continue even if one level fails
          })
      );

      const results = await Promise.allSettled(fetchPromises);
      this.list = results
        .filter(r => r.status === "fulfilled" && r.value)
        .map(l => ({
          name: l.value.name,
          normalizedName: l.value.name.replace(/-/g, " ").trim().toLowerCase(),
          link: l.value.link,
          scores: l.value.scores || []
        }));

      // 3️⃣ Define your packs
      this.packs = [
        {
          name: "",
          levels: ["Asterion-13", "Doggie Challenge", "Paraklausithuron"],
          bonusPoints: 50
        }
      ];

    } catch (err) {
      console.error("Error initializing packs:", err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    // Find level object by name (case/space/dash insensitive)
    getLevelByName(name) {
      const normalized = name.replace(/-/g, " ").trim().toLowerCase();
      return this.list.find(l => l.normalizedName === normalized) || { name: "Unknown", link: null, scores: [] };
    },

    // Convert YouTube link to embed URL
    getEmbedUrl(url) {
      if (!url) return null;
      const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
      const long = url.match(/v=([A-Za-z0-9_-]{11})/);
      const embed = url.match(/embed\/([A-Za-z0-9_-]{11})/);
      const id = short?.[1] || long?.[1] || embed?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    },

    // Check if user completed all levels in a pack
    userCompletedPack(pack) {
      if (!this.username) return false;
      return pack.levels.every(levelName => {
        const level = this.getLevelByName(levelName);
        return level.scores.some(s => s.name === this.username);
      });
    },

    // Get bonus points if user completed the pack
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
        <p class="bonus" v-if="userCompletedPack(pack)">
          Completed! +{{ pack.bonusPoints }} pts
        </p>
        <p class="bonus" v-else>
          Bonus: +{{ pack.bonusPoints }} pts (incomplete)
        </p>
      </div>
    </div>
  `
};
