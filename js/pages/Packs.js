export default {
  name: "Packs",
  data() {
    return {
      loading: true,
      packs: [
        {
          name: "Starter Pack",
          levels: ["Asterion-13", "Doggie-Challenge", "Paraklausithuron"],
          bonusPoints: 50
        },
        {
          name: "Wave Pack",
          levels: ["BaguetteFly", "Spaceship-piloooot", "Trouble"],
          bonusPoints: 100
        },
        {
          name: "Challenge Pack",
          levels: ["Kazko", "Frozen-Spike", "Lag-spike"],
          bonusPoints: 75
        }
      ],
      videos: [],
      error: null,
    };
  },
  template: `
    <main class="page-roulette-container" v-if="loading">
      <div class="spinner">Loading packs...</div>
    </main>

    <main class="page-roulette-container" v-else>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-for="pack in videos" :key="pack.name" class="pack-card">
        <h2>{{ pack.name }} (+{{ pack.bonusPoints }} pts)</h2>
        <div class="video-grid">
          <div
            v-for="level in pack.levels"
            :key="level.name"
            class="video-item"
          >
            <h3>{{ level.name }}</h3>
            <iframe
              v-if="level.embedUrl"
              :src="level.embedUrl"
              frameborder="0"
              allowfullscreen
            ></iframe>
            <p v-else>No verification video found</p>
          </div>
        </div>
      </div>
    </main>
  `,
  async mounted() {
    try {
      const videoPacks = [];

      for (const pack of this.packs) {
        const levelVideos = [];

        for (const levelName of pack.levels) {
          const levelPath = `/data/${encodeURIComponent(levelName)}.json`;

          try {
            const res = await fetch(levelPath);
            if (!res.ok) continue;
            const data = await res.json();

            const embedUrl = this.convertToEmbed(data.verification);
            levelVideos.push({
              name: levelName,
              embedUrl,
            });
          } catch (err) {
            console.warn("Could not load level:", levelName, err);
          }
        }

        videoPacks.push({
          name: pack.name,
          levels: levelVideos,
          bonusPoints: pack.bonusPoints,
        });
      }

      this.videos = videoPacks;
    } catch (err) {
      console.error(err);
      this.error = "Failed to load packs.";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    convertToEmbed(link) {
      if (!link) return null;
      // Handle multiple YouTube URL formats
      const match = link.match(/(?:youtu\.be\/|v=|embed\/)([^?&]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return null;
    },
  },
};
