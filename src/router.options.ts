import type { RouterConfig } from "@nuxt/schema";
import { routes } from "./routes";

// Nuxt memakai rute kustom dari src/routes.ts (bukan dari direktori pages/)
export default {
  routes: () => routes,
} satisfies RouterConfig;
