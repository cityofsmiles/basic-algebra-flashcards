import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Replace with your GitHub repo name
const repoName = "https://github.com/cityofsmiles/basic-algebra-flashcards.git";

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
  build: {
    outDir: "dist",
  },
});