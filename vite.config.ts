import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// API configuration
const RAPID_API_KEY = '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee';
const RAPID_API_HOST = 'yahoo-finance127.p.rapidapi.com';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
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
    cors: true,
    proxy: {
      '/api/stock-data': {
        target: `https://${RAPID_API_HOST}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stock-data/, '/v1/finance/quote'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('X-RapidAPI-Key', RAPID_API_KEY);
            proxyReq.setHeader('X-RapidAPI-Host', RAPID_API_HOST);
          });
          proxy.on('proxyRes', (proxyRes, _req, _res) => {
            // Add CORS headers to allow all origins
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host, Origin, Accept';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
          });
          
          // Log errors for debugging
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
        },
      },
    },
  },
  plugins: [
    react(),
  ],
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(mode),
      VITE_RAPID_API_KEY: JSON.stringify(RAPID_API_KEY),
      VITE_RAPID_API_HOST: JSON.stringify(RAPID_API_HOST),
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
