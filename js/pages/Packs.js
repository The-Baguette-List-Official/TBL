export default {
  name: "Packs",
  data() {
    return {
      loading: true,
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
      <div v-else class="packs-container">
        <div v-for="video in videos" :key="video.name" class="pack-item">
          <h2>{{ video.name }}</h2>
          <iframe
            v-if="video.embedUrl"
            :src="video.embedUrl"
            frameborder="0"
            allowfullscreen
            class="video-embed"
          ></iframe>
          <p v-else>No video link found.</p>
        </div>
      </div>
    </main>
  `,
  async mounted() {
    try {
      // fetch the list of levels from _list.json
      const listResponse = await fetch("/data/_list.json");
      const levelNames = await listResponse.json();

      const videos = [];

      // Fetch each level JSON file and extract its link
      for (const levelName of levelNames) {
        const levelFile = `/data/${encodeURIComponent(levelName)}.json`;
        try {
          const res = await fetch(levelFile);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.link) {
            // Convert the YouTube link to an embeddable format
            const embedUrl = this.convertToEmbed(data.link);
            videos.push({ name: levelName, embedUrl });
          }
        } catch (e) {
          console.warn("Could not load", levelFile, e);
        }
      }

      this.videos = videos;
    } catch (e) {
      console.error(e);
      this.error = "Failed to load packs.";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    convertToEmbed(link) {
      if (!link) return null;
      // handles youtu.be, youtube.com/watch?v= and other variants
      const match = link.match(/(?:youtu\.be\/|v=)([^&]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    },
  },
};
