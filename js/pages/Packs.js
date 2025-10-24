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
      const res = await fetch("/data/_list.json").catch(() => null);
      const levelNames = res ? await res.json() : [];
      this.list = levelNames.map(n => ({ name: n, link: null, scores: [] }));

      // Example packs
      this.packs = [
        { name: "Starter Pack", levels: this.list.slice(0, 3).map(l => l.name), bonusPoints: 50 },
        { name: "Challenge Pack", levels: this.list.slice(3, 6).map(l => l.name), bonusPoints: 75 }
      ];
    } catch (err) {
      console.error("Error loading packs:", err);
    } finally {
      this.loading = false;
    }
  },
  template: `
    <div v-if="loading" style="color:white; padding:2rem;">Loading packs...</div>
    <div v-else style="color:white; padding:2rem;">
      <div v-for="pack in packs" :key="pack.name" style="margin-bottom:2rem;">
        <h3>{{ pack.name }}</h3>
        <ul>
          <li v-for="level in pack.levels" :key="level">{{ level }}</li>
        </ul>
        <p>Bonus: +{{ pack.bonusPoints }} pts</p>
      </div>
    </div>
  `
};