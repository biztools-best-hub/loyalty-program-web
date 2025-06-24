import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import cert from 'vite-plugin-mkcert'
// import ssl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // cert(),
    // ssl()
  ],
  build: {
    chunkSizeWarningLimit: 5000,
    outDir: '../dist/public',
    emptyOutDir: true
  },
  server: {
    // https: false,
    host: 'localhost',
    port: 7272,
    cors: {
      origin: true,
      methods: "GET,DELETE,PUT,POST",
      credentials: false
    }
  }
})
