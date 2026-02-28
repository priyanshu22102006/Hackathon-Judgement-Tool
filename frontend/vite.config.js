import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Read VITE_BACKEND_PORT from the frontend's own .env (if set),
// otherwise fall back to 5001 which matches the backend's default PORT.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendPort = env.VITE_BACKEND_PORT || "5001";

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/api": `http://localhost:${backendPort}`,
      },
    },
  };
});
