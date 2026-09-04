import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Local dev: the app calls fetch("/api/...") — proxy those to the backend
// (npm run dev in ../backend, default port 4000) so no CORS setup or env
// var is needed. In production (Vercel) the same "/api/..." path is routed
// straight to the backend serverless function by the root vercel.json.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
