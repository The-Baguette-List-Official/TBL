// /js/pages/Packs.js
export default {
  name: "Packs",
  data() {
    return {
      packs: [
        {
          name: "The Former Top 1's",
          levels: ["Colorblind", "Champions Road", "My spike is laggy"],
          bonusPoints: 150,
        },
      ],
    };
  },
  template: `
    <div id="tab-packs" class="packs-grid">
      <div v-for="pack in packs" :key="pack.name" class="pack-card">
        <h3>{{ pack.name }}</h3>
        <ul>
          <li v-for="lvl in pack.levels" :key="lvl">{{ lvl }}</li>
        </ul>
        <p class="bonus">Bonus: +{{ pack.bonusPoints }} pts</p>
      </div>
    </div>
  `,
};
