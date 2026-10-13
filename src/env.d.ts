/// <reference types="vite/client" />

/** Base URL Delcom Open API (diinjeksi lewat `define` di nuxt.config.ts / vite.config.ts). */
declare const DELCOM_BASEURL: string;

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
