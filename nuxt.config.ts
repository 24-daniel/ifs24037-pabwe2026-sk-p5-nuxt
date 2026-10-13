import tailwindcss from "@tailwindcss/vite";

const customPort = Number(process.env.APP_PORT || process.env.PORT) || 3000;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  telemetry: false,
  // Matikan SSR -> mode SPA (routing & penyimpanan token di sisi klien)
  ssr: false,
  // Nuxt membaca kode aplikasi dari src/
  srcDir: "src/",
  // Aktifkan vue-router; rute disuplai oleh src/router.options.ts
  pages: true,
  // Font di-host sendiri (tidak lagi memuat stylesheet Google Fonts yang memblokir render)
  css: ["@fontsource-variable/plus-jakarta-sans", "~/index.css"],
  // Tampilkan shell ringan secepat mungkin selagi aplikasi SPA dimuat (memperbaiki FCP)
  spaLoadingTemplate: true,
  experimental: {
    // Tidak perlu fetch manifest build tambahan pada aplikasi SPA statis
    appManifest: false,
  },
  routeRules: {
    // Proxy satu-origin ke Delcom Open API. Browser tidak melakukan CORS lintas-origin,
    // sehingga peringatan "Authorization will not be covered by the wildcard (*)"
    // (audit Lighthouse "Uses deprecated APIs") tidak muncul.
    "/delcom-api/**": { proxy: "https://open-api.delcom.org/api/v1/**" },
    "/**": {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      },
    },
  },
  modules: ["@pinia/nuxt"],
  vite: {
    plugins: [tailwindcss()],
    define: {
      // Build Nuxt selalu lewat proxy "/delcom-api" (lihat routeRules).
      // Vitest tetap memakai VITE_DELCOM_BASEURL dari vite.config.ts.
      DELCOM_BASEURL: JSON.stringify("/delcom-api"),
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },
  devServer: {
    port: customPort,
  },
  nitro: {
    devPort: customPort,
  },
  app: {
    head: {
      title: "Delcom Cash Flow",
      htmlAttrs: { lang: "id" },
      meta: [
        {
          name: "description",
          content:
            "Delcom Cash Flow: catat pemasukan dan pengeluaran, pantau saldo tunai, tabungan, dan pinjaman dalam satu dashboard.",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
      ],
      bodyAttrs: {
        class: "bg-slate-50 text-slate-900 font-sans antialiased min-h-screen",
      },
    },
  },
});
