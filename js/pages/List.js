import levels from '../../data/_list.json';

export default {
  name: "List",
  data() {
    return {
      levels: [],
      loading: true,
      error: null,
    };
  },

  async mounted() {
    try {
      // Convert each level name to display format (replace dashes with spaces)
      this.levels = levels.map((levelName, index) => ({
        name: levelName.replace(/-/g, " "),
        index,
      }));
      this.loading = false;
    } catch (err) {
      this.error = err.message;
      this.loading = false;
    }
  },

  template: `
    <main v-if="loading" class="page-list-container">
      <p class="type-label-lg">Loading list...</p>
    </main>

    <main v-else class="page-list-container">
      <div class="list-container">
        <div v-for="level in levels" class="level">
          <button class="level-btn">
            <span class="level-name">{{ level.name }}</span>
          </button>
        </div>
      </div>
    </main>
  `,
};
