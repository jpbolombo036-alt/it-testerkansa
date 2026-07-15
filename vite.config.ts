import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 4173,
  },
  build: {
    esbuild: {
      pure: ['console.log', 'console.info', 'console.debug'],
      drop: ['debugger'],
    },
  },
})
