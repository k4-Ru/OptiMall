import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => `/FINAL%20VOTING%20SYSTEM/bscs3b${path}`,
      },
    },
  },
});
