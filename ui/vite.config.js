import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',  // Enable top-level await
    polyfillModulePreload: true,
  },
  optimizeDeps: {
    exclude: ["@noir-lang/noirc_abi", "@noir-lang/acvm_js"],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    port: 3000,
    open: true
  }
})