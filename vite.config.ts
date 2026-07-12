import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // 优化配置
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将大型依赖库分离
          'vendor-react': ['react', 'react-dom'],
          'vendor-codemirror': [
            'codemirror',
            '@codemirror/state',
            '@codemirror/view',
            '@codemirror/lang-markdown',
            '@codemirror/language-data',
            '@codemirror/theme-one-dark',
            '@codemirror/autocomplete',
            '@codemirror/commands',
          ],
          'vendor-highlight': ['highlight.js'],
          'vendor-marked': ['marked'],
          'vendor-tauri': [
            '@tauri-apps/api',
            '@tauri-apps/plugin-dialog',
            '@tauri-apps/plugin-fs',
            '@tauri-apps/plugin-opener',
          ],
        },
      },
    },
    
    // 分块大小警告限制
    chunkSizeWarningLimit: 500,
  },
  
  // 开发服务器配置
  server: {
    port: 1420,
    strictPort: true,
  },
  
  // 环境变量前缀
  envPrefix: 'VITE_',
});
