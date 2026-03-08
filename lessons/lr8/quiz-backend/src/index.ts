import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import auth from "./routes/auth.js";

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/health', (c) => {
  return c.text('OK')
})

//подключил routes/auth
app.route('/', auth)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
