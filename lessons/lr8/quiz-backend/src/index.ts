import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/auth.js'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/api/auth', authRoutes)

const port = 3000
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`)
})