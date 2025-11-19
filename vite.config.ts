import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    // 🔹 ważne dla GitHub Pages – bo strona jest pod /PapaData/
    base: "/PapaData/",

    server: {
      port: 3000,
      host: "0.0.0.0",
    },

    // 🔹 budujemy od razu do katalogu docs (GitHub Pages będzie z niego serwować)
    build: {
      outDir: "docs",
      emptyOutDir: true,
    },

    plugins: [react()],

    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
