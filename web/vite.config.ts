import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 8081,
      strictPort: true,
      fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'http://127.0.0.1:8888',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
