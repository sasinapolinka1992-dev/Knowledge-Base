
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Замените 'Knowledge-Base' на точное название вашего репозитория на GitHub
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
