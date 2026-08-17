import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [
    {
      name: "admin-short-url",
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url === "/admin" || request.url === "/admin/") {
            response.statusCode = 302;
            response.setHeader("location", "/admin.html");
            response.end();
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4173",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets/build",
    sourcemap: true,
    rollupOptions: {
      input: {
        website: fileURLToPath(new URL("./index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./admin.html", import.meta.url)),
      },
    },
  },
});
