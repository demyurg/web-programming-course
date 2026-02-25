import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import auth from './routes/auth.js'

const app = new Hono()

// 🔹 Маршрут для проверки работоспособности сервера
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// 🔹 Подключаем все маршруты аутентификации
app.route('/api/auth', auth)

// 🔹 Главная страница
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// 🔹 Запуск сервера на порту 3000
serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)