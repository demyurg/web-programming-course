import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/auth.js'
import sessionsRoutes from './routes/sessions.js'
import adminRoutes from './routes/admin.js'

const app = new Hono({ strict: false })

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/api/auth', authRoutes)
app.route('/api/sessions', sessionsRoutes)
app.route('/api/admin', adminRoutes)

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Server running on http://localhost:3000')
})