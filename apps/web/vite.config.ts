import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // odpowiada za podzial bundle na mniejsze chunki produkcyjne
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("firebase")) return "vendor-firebase";
          if (id.includes("react")) return "vendor-react";
          return "vendor";
        },
      },
    },
  },

  // odpowiada za eliminację CORS w dev (front:5173 -> api:3001)
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
