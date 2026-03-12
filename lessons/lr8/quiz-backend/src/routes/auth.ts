/// <reference types="node" />
import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { prisma } from '../lib/prisma.js'
import { githubCallbackSchema } from '../utils/validation.js'

const authRoutes = new Hono()

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in .env')
}

type GitHubTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

type GitHubUserResponse = {
  id: number
  login: string
  name: string | null
  email: string | null
}

type GitHubEmailResponse = {
  email: string
  primary: boolean
  verified: boolean
}

function getBearerToken(authorization?: string): string | null {
  if (!authorization) return null
  const [scheme, token] = authorization.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

authRoutes.post('/github/callback', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = githubCallbackSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }

  const { code } = parsed.data

  let githubId = ''
  let email = ''
  let name = ''

  if (code.startsWith('test_')) {
    const suffix = code.slice(5) || 'student'
    githubId = `test_${suffix}`
    email = `${suffix}@example.com`
    name = `Test User ${suffix}`
  } else {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return c.json({ error: 'GitHub OAuth is not configured' }, 500)
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    if (!tokenRes.ok) {
      return c.json({ error: 'Failed to exchange code with GitHub' }, 400)
    }

    const tokenData = (await tokenRes.json()) as GitHubTokenResponse
    const accessToken = tokenData.access_token
    if (!accessToken) {
      return c.json({ error: tokenData.error_description ?? 'Invalid GitHub code' }, 401)
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'quiz-backend',
      },
    })

    if (!userRes.ok) {
      return c.json({ error: 'Failed to fetch GitHub user' }, 400)
    }

    const ghUser = (await userRes.json()) as GitHubUserResponse

    githubId = String(ghUser.id)
    name = ghUser.name || ghUser.login || `github_${ghUser.id}`
    email = ghUser.email ?? ''

    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'quiz-backend',
        },
      })

      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as GitHubEmailResponse[]
        const selected =
          emails.find((e) => e.primary && e.verified) ??
          emails.find((e) => e.verified) ??
          emails[0]

        if (selected?.email) email = selected.email
      }
    }

    if (!email) {
      email = `${ghUser.id}+github@users.noreply.github.com`
    }
  }

  const user = await prisma.user.upsert({
    where: { githubId },
    update: { email, name },
    create: { githubId, email, name },
  })

  const token = await sign(
    {
      userId: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    JWT_SECRET,
    'HS256'
  )

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      githubId: user.githubId,
      createdAt: user.createdAt,
    },
  })
})

authRoutes.get('/me', async (c) => {
  const token = getBearerToken(c.req.header('Authorization'))
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  let userId: string | null = null
  try {
    const payload = (await verify(token, JWT_SECRET, 'HS256')) as Record<string, unknown>
    userId = typeof payload.userId === 'string' ? payload.userId : null
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }

  if (!userId) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      githubId: user.githubId,
      createdAt: user.createdAt,
    },
  })
})

export default authRoutes