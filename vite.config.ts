import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Set VITE_BASE_PATH="/admin/" only when the app is served from a sub-folder
  // (e.g. GitHub Pages project sites). Defaults to the domain root.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
})
