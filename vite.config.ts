import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Project Pages URL: https://gobi-wan-kenobi.github.io/RegisterBuddy-casestudy/
export default defineConfig({
  plugins: [react()],
  base: '/RegisterBuddy-casestudy/',
})
