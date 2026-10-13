// Entry untuk mode Vite murni (`bun run dev:vite`). Nuxt tidak memakai berkas ini.
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createWebHistory } from "vue-router";
import App from "./App.vue";
import { createAppRouter } from "./router";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";

createApp(App).use(createPinia()).use(createAppRouter(createWebHistory())).mount("#app");
