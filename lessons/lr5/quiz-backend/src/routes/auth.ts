import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { PrismaClient } from '@prisma/client'
import { githubCodeSchema } from '../utils/validation'

const auth = new Hono()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

// Функция для проверки JWT из Authorization header
async function verifyToken(c: any) {
  const authHeader = c.req.header('Authorization')

    if (!authHeader) {
  return c.json({ error: 'Unauthorized' }, 401)
}
  
  const token = authHeader.replace('Bearer ', '')

try {
  const payload = await verify(token, JWT_SECRET, 'HS256')
} catch {
  return c.json({ error: 'Invalid token' }, 401)
}
}

// Endpoint GitHub OAuth (mock + real)
auth.post('/github/callback', async (c) => {
  const body = await c.req.json()
  const parsed = githubCodeSchema.safeParse(body)

  if (!parsed.success) return c.json({ error: 'Invalid code' }, 400)
  const { code } = parsed.data

  let githubUser

  // MOCK режим
  if (code.startsWith('test_')) {
    githubUser = {
      id: '1001',
      email: `test_${Date.now()}@example.com`,
      name: 'Test User',
    }
  } else {
    // REAL режим: обмен code на access token + получение данных пользователя
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID || '',
        client_secret: process.env.GITHUB_CLIENT_SECRET || '',
        code,
      }),
    })
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const userData = await userRes.json()

    githubUser = {
      id: userData.id.toString(),
      email: userData.email || `${userData.login}@github.local`,
      name: userData.name || userData.login,
    }
  }

  // upsert пользователя
  const user = await prisma.user.upsert({
    where: { githubId: githubUser.id },
    update: { email: githubUser.email, name: githubUser.name },
    create: { githubId: githubUser.id, email: githubUser.email, name: githubUser.name },
  })

  // Создаём JWT
  const token = await sign({ sub: user.id, email: user.email }, JWT_SECRET)

  return c.json({ token, user })
})

// Endpoint для текущего пользователя
auth.get('/me', async (c) => {
  const { payload, error, status } = await verifyToken(c)

  if (error) return c.json({ error }, status)

  // Ищем пользователя в базе
  const user = await prisma.user.findUnique({ where: { id: payload.sub } })

  if (!user) return c.json({ error: 'User not found' }, 404)

  return c.json({ user })
})

export default auth