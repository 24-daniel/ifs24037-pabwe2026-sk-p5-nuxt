import { createRouter, type RouterHistory } from "vue-router";
import { routes } from "./routes";

/** Router berbasis rute yang sama dengan Nuxt (dipakai entry Vite dan pengujian). */
export function createAppRouter(history: RouterHistory) {
  return createRouter({ history, routes });
}
