import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Replace with your GitHub repo name
const repoName = "cityofsmiles/basic-algebra-flashcards";

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
  build: {
    outDir: "dist",
  },
});