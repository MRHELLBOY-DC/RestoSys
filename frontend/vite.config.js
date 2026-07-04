import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // sockjs-client references the Node.js `global` object, which doesn't exist in the browser
    global: 'window',
  },
})
