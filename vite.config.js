import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Определяем base path для GitHub Pages
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'AHKBuilderoz'; // Имя вашего репозитория

export default defineConfig({
  base: isGitHubPages ? `/${repoName}/` : './',
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
