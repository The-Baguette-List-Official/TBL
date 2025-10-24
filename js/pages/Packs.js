// /js/pages/Packs.js

const level1 = { name: "Colorblind", link: "https://youtu.be/VIDEOID1" };
const level2 = { name: "Champions-Road", link: "https://youtu.be/VIDEOID2" };
const level3 = { name: "My-Spike-is-Laggy", link: "https://youtu.be/VIDEOID3" };

export default {
  name: "Packs",
  data() {
    return {
      packs: [
        {
          name: "The Former Top 1's",
          levels: [level1, level2, level3],
          bonusPoints: 50,
        },
        // other packs...
      ],
    };
  },
  methods: {
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
      <div v-for="pack in packs" :key="pack.name" class="pack-card">
        <h3>{{ pack.name }}</h3>
        <ul>
          <li v-for="lvl in pack.levels" :key="lvl.name">{{ lvl.name }}</li>
        </ul>
        <div class="videos">
          <div v-for="lvl in pack.levels" :key="lvl.name + '-vid'" v-if="getEmbedUrl(lvl.link)" class="video-frame">
            <iframe
              width="100%"
              height="180"
              :src="getEmbedUrl(lvl.link)"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
        <p class="bonus">Bonus: +{{ pack.bonusPoints }} pts</p>
      </div>
    </div>
  `,
};
