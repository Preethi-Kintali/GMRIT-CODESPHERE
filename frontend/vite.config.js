import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router"],
          stream: ["@stream-io/video-react-sdk", "stream-chat"],
          monaco: ["@monaco-editor/react"],
          vendor: ["lucide-react", "date-fns"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
