import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/auth.js'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})
app.route('/api/auth', authRoutes)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
