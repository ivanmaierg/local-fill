import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        options: resolve(__dirname, 'src/options/main.tsx'),
        overlay: resolve(__dirname, 'src/overlay/main.tsx'),
        styles: resolve(__dirname, 'src/styles/tailwind.css'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          // Keep CSS files as .css
          if (assetInfo.name?.endsWith('.css')) {
            return '[name].css';
          }
          // Keep other assets with their extensions
          return '[name].[ext]';
        },
      },
      external: (id) => {
        // Don't bundle chrome types
        return id.startsWith('chrome');
      },
    },
    target: 'es2022',
    minify: false, // Keep readable for debugging
    sourcemap: true, // Generate source maps for debugging
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'lib': resolve(__dirname, '../../packages/lib/src'),
      'ui': resolve(__dirname, '../../packages/ui/src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    hmr: {
      port: 3001,
    },
  },
});
