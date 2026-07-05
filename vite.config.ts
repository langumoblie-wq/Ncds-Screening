import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // เปลี่ยน /my-repo-name/ เป็นชื่อ repository ของคุณใน GitHub
    // เช่น ถ้า URL คือ https://username.github.io/ncd-screening/ ให้ใส่ base: '/ncd-screening/'
    // หากทดสอบใน AI Studio ให้ใช้ '/' ชั่วคราว หรือใช้ process.env เพื่อแยกแยะ Environment
    base: process.env.NODE_ENV === 'production' ? '/NCDs-Screening/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
