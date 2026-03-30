import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  // Environment variables will be automatically loaded from .env.local
  // Access them with: import.meta.env.REACT_APP_SUPABASE_URL
})
