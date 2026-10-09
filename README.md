# ifs24037-pabwe2026-sk-p5-nuxt

Delcom Cash Flow - Nuxt 4 (TypeScript, SPA), Pinia, Tailwind CSS v4, Vitest.

## Menjalankan

```bash
bun install
bun run dev            # http://localhost:3000
bun run test:coverage  # target 100%
bun run build && bun run start
```

## Yang perlu kamu ubah / sesuaikan

1. Username: sudah memakai `ifs24037`. Ubah di `package.json` (`name`), `sonar-project.properties`
   (`sonar.projectKey`, `sonar.projectName`) dan `Jenkinsfile` kalau username berbeda.
2. Repo GitHub harus bernama persis `ifs24037-pabwe2026-sk-p5-nuxt` (prefix URL wajib dari Delcom).
3. `.env` tidak ikut di git (di-ignore). Salin dari `.env.example` bila perlu.
4. `Jenkinsfile`: sesuaikan `SONARQUBE_SERVER` dan `SONAR_SCANNER_TOOL` dengan nama di Jenkins
   (Manage Jenkins > System > SonarQube servers, dan Tools > SonarQube Scanner).
5. Pastikan server Jenkins punya Node.js (untuk Nuxt/Vitest) dan akses internet untuk memasang bun.
