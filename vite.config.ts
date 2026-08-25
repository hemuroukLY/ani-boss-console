import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
        autoCodeSplitting: true,
      }),
      react(),
    ],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: {
      port: 5174,
      proxy: env.VITE_API_PROXY_TARGET
        ? { '/api': { target: env.VITE_API_PROXY_TARGET, changeOrigin: true } }
        : undefined,
    },
    build: { target: 'esnext' },
  }
})

