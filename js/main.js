import routes from './routes.js';

export const store = Vue.reactive({
    dark: JSON.parse(localStorage.getItem('dark')) || false,
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

// Create root app
const app = Vue.createApp({
    setup() {
        return { store };
    }
});

// Setup router safely
try {
    const router = VueRouter.createRouter({
        history: VueRouter.createWebHashHistory(),
        routes,
    });

    app.use(router);
    app.mount('#app');

} catch (err) {
    console.error("Error initializing Vue:", err);
}