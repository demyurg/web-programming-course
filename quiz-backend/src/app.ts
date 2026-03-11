import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { auth } from './routes/auth'
import sessionsRoutes from './routes/sessions'
import questionsRoutes from './routes/questions'
import adminRoutes from './routes/admin'

export const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Routes
app.route('/api/auth', auth)
app.route('/api/sessions', sessionsRoutes)
app.route('/api/questions', questionsRoutes)
app.route('/api/admin', adminRoutes)

// Health check
app.get('/health', (c) => c.json({
    status: 'ok',
    timestamp: new Date().toISOString()
}))

// Error handling
app.onError((err, c) => {
    console.error('Unhandled error:', err)
    return c.json({ error: 'Internal Server Error' }, 500)
})

// Not found
app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404)
})

export default app