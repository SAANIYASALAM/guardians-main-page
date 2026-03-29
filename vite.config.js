import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Optional backend proxy for local development.
// Set environment variable BACKEND_URL to your API server (e.g. http://localhost:5000)
const backend = process.env.BACKEND_URL || ''

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  server: backend
    ? {
        proxy: {
          '/api': {
            target: backend,
            changeOrigin: true,
            secure: false,
          },
        },
      }
    : undefined,
})
