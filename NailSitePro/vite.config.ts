import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// Assuming you still need these plugins for Replit/error modal
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
// Assuming dotenv/config is needed for other variables, but VITE_* are handled by Vite
import 'dotenv/config'; // This loads variables into process.env *before* Vite runs

export default async () => {
  const plugins = [
    react(),
    // Assuming you still need the error modal plugin
    runtimeErrorOverlay(),
  ];

  // Keep your conditional Replit plugin logic
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
  ) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return defineConfig({
    plugins, // Your existing plugins
    resolve: {
      alias: {
        // Keep your existing path aliases
        "@": path.resolve(import.meta.dirname, "client", "src"),
        // Uncomment/adjust if you need these aliases
        // "@shared": path.resolve(import.meta.dirname, "shared"),
        // "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"), // Keep your root setting
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"), // Keep your build output dir
      emptyOutDir: true,
    },

    // --- Add this 'server' configuration block ---
    server: {
      port: 3000, // Set the development server port to 3000
      proxy: {
        // Configure the proxy to forward API requests to your Django backend
        '/api': {
          target: 'http://127.0.0.1:8000', // <--- The address of your Django backend server
          changeOrigin: true, // Needed for CORS to work correctly
          // If your Django API endpoints *don't* start with /api (e.g., just /auth/...),
          // you would need a rewrite rule here:
          // rewrite: (path) => path.replace(/^\/api/, '')
          // Based on your schema /api/auth, /api/blog etc., you likely DO need the /api,
          // so the rewrite is probably NOT needed.
        },
        // Add other proxy rules if necessary for other backend endpoints (e.g., /admin/)
        // '/admin': {
        //   target: 'http://127.0.0.1:8000',
        //   changeOrigin: true,
        // },
      },
       // Optional: Enable host if you need to access from other devices on the network
       // host: true,
    },
    // ---------------------------------------------

    // Other Vite configuration might go here if you have more
  });
};