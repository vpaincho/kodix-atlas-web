import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync } from "node:fs";

// Dev server escucha en todas las interfaces para poder verificar desde el
// navegador en localhost. El laboratorio vive en /labs (segunda entrada).
// Rutas de entrada relativas a la raíz del proyecto (sin node:path).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        ...(existsSync("labs/index.html") ? { labs: "labs/index.html" } : {}),
      },
    },
  },
});
