import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  base: "/admin/",
  assetsInclude: ["**/*.xlsx"],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Moderation API — same-origin in the browser, forwarded server-side (no CORS preflight).
      // Production equivalent: the /moderation-api rewrite in vercel.json.
      "/moderation-api": {
        target: "https://api.kaizencon.in",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/moderation-api/, "/api"),
      },
    },
  },
});
