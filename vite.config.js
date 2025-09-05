import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	  plugins: [react()],
	    base: "/basic-algebra-flashcards/", //  MUST match repo name
	      build: {
	      	    outDir: "dist",
	      	      },
	      	      });
	      

