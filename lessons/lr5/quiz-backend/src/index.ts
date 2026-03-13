import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import auth from './routes/auth'

const app = new Hono()

app.route('/api/auth', auth)

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

serve({
  fetch: app.fetch,
  port: 3000
})

console.log('🚀 Server running on http://localhost:3000')