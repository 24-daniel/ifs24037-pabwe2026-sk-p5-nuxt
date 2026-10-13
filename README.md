# Delcom Cash Flow (Nuxt 4) — PABWE 2026 Praktikum 5

Aplikasi pencatatan arus kas berbasis **Nuxt 4 (SPA, `ssr: false`) + TypeScript**, memakai
Delcom Open API (`https://open-api.delcom.org/docs/1.0/api-cash-flows`).

Stack: bun · Nuxt 4 · @pinia/nuxt · Tailwind CSS v4 · SweetAlert2 · lucide-vue-next ·
Vitest (jsdom, coverage v8, threshold 100%).

## Menjalankan

```bash
bun install
bun run dev              # http://localhost:3000 (port dari APP_PORT)
bun run test             # unit + integration test
bun run test:coverage    # coverage v8 (threshold 100%)
bun run build            # build produksi Nuxt
bun run start            # nuxt preview pada APP_PORT (start.mjs)
```

`.env`:

```
VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
APP_PORT=3000
```

## Struktur

```
src/
├── App.vue · App.test.ts · env.d.ts · index.css · main.ts
├── router.options.ts   rute kustom Nuxt  ->  routes.ts
├── routes.ts           /auth/* (tamu), / (terproteksi), /:pathMatch(.*)* (404)
├── router.ts           createAppRouter (dipakai main.ts & pengujian)
├── setupTests.ts · test-utils.ts
├── helpers/            apiHelper.ts · toolsHelper.ts
├── hooks/              useInput.ts
└── features/
    ├── auth/           api · states(authStore) · layouts(AuthLayout) · pages(Login, Register)
    ├── users/          api · states(usersStore) · pages(Users, Profile)
    ├── cashflows/      api · states(cashFlowsStore) · layouts(CashFlowLayout)
    │                   components(Navbar, Sidebar) · modals(Add, Change) · pages(Home, Detail)
    └── common/pages/   NotFoundPage.vue
```

## Catatan

- Ganti kata sandi memakai `PUT /users/password` (sesuai dokumentasi API; modul menulis `/users/me/password`).
- Saldo tunai/tabungan/pinjaman dihitung dari `total_inflow_<sumber>` dikurangi `total_outflow_<sumber>`
  pada `stats` respons `GET /cash-flows`.
- `bun run dev:vite` / `build:vite` menjalankan mode Vite murni (entry `index.html` -> `src/main.ts`).
- Deploy Netlify: build command `bun run build`, Nuxt otomatis memakai preset Netlify. Nama situs harus
  `{username}-pabwe2026-sk-p5-nuxt` untuk Delcom Grading.
- Repositori/folder: `{username}-pabwe2026-sk-p5-nuxt`, mis. `ifs18005-pabwe2026-sk-p5-nuxt`.
