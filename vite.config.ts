import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages にデプロイする場合は VITE_BASE_PATH 環境変数でパスを注入する
// 例: VITE_BASE_PATH=/shuffler/ npm run build
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,   // dev サーバーでも PWA を有効にする
      },
      manifest: {
        name: 'フラッシュカード',
        short_name: 'フラッシュカード',
        description: 'PDF・画像でフラッシュカード学習',
        theme_color: '#030712',
        background_color: '#030712',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // IndexedDB に保存した画像は Service Worker キャッシュ不要
        // アプリシェル（JS/CSS）のみキャッシュ
        globPatterns: ['**/*.{js,css,html,svg}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
    }),
  ],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
})
