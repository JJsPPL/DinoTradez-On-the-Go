import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/DinoTradez-On-the-Go/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/stock-data': {
        target: 'https://yahoo-finance127.p.rapidapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stock-data/, '/v1/finance/quote'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('X-RapidAPI-Key', '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee');
            proxyReq.setHeader('X-RapidAPI-Host', 'yahoo-finance127.p.rapidapi.com');
          });
          proxy.on('proxyRes', (proxyRes, _req, _res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type';
          });
        },
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
