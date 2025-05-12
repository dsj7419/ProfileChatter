import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'copy-chat-data',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/chatData.json') {
            try {
              const chatData = fs.readFileSync(
                path.resolve(__dirname, '../data/chatData.json'),
                'utf-8'
              )
              res.setHeader('Content-Type', 'application/json')
              res.end(chatData)
            } catch (err) {
              console.error('Error reading chat data:', err)
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to read chat data' }))
            }
          } else {
            next()
          }
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true
  }
})