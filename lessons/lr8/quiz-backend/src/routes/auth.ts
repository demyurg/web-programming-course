import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { getGitHubUserByCode, GitHubServiceError } from '../services/github.js'
import { githubCallbackSchema } from '../utils/validation.js'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })
const auth = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'

auth.post('/github/callback', async (c) => {
  const body = await c.req.json()
  const parsed = githubCallbackSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid request: code is required' }, 400)
  }

  const { code } = parsed.data

  try {
    const githubUser = await getGitHubUserByCode(code)

    const user = await prisma.user.upsert({
      where: { githubId: String(githubUser.id) },
      update: {
        email: githubUser.email || '',
        name: githubUser.name || '',
      },
      create: {
        githubId: String(githubUser.id),
        email: githubUser.email || `${githubUser.id}@github.com`,
        name: githubUser.name || 'GitHub User',
      },
    })

    const token = await sign(
      { userId: user.id, email: user.email },
      JWT_SECRET
    )

    return c.json({ token, user })
  } catch (error) {
    if (error instanceof GitHubServiceError) {
      return c.json({ error: error.message }, error.statusCode as 400 | 500)
    }
    return c.json({ error: 'Internal server error' }, 500 as const)
  }
})

export { auth }
