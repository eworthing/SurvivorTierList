import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use ESM-friendly import.meta.url to construct a file path for the alias.
// This avoids importing Node-only modules like 'path' or using `__dirname`.
const keyboardShimPath = new URL('src/types/capacitor-keyboard-shim.ts', import.meta.url).pathname

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // stub Capacitor keyboard module in web/dev to avoid Vite import-analysis errors
      '@capacitor/keyboard': keyboardShimPath,
    }
  }
})
