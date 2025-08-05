import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Đảm bảo assets phục vụ từ root
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost', // HMR dùng localhost
    },
    proxy: {
      '/auth': {
        target: 'http://auth-service:8000', // Gọi nội bộ qua network
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ''),
      },
      '/todos': {
        target: 'http://todo-service:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/todos/, ''),
      },
    },
  },
});