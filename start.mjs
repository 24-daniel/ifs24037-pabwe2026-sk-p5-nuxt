import { spawn } from "child_process";
import { config } from "dotenv";

// Membaca APP_PORT dari .env lalu menjalankan `nuxt preview` pada port tersebut.
config();

const port = process.env.APP_PORT || process.env.PORT || 3000;
process.env.PORT = port;

console.log(`Menjalankan Nuxt preview pada port ${port}...`);

const nuxtPreview = spawn("npx", ["nuxt", "preview", "--port", port], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

nuxtPreview.on("close", (code) => {
  process.exit(code);
});
