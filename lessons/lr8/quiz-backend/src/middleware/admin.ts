/// <reference types="node" />
import type { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'
import { prisma } from '../lib/prisma.js'

const JWT_SECRET: string = (() => {
  const v = process.env.JWT_SECRET
  if (!v) throw new Error('JWT_SECRET is not set in .env')
  return v
})()

function getBearerToken(authorization?: string): string | null {
  if (!authorization) return null
  const [scheme, token] = authorization.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const token = getBearerToken(c.req.header('Authorization'))
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const payload = (await verify(token, JWT_SECRET, 'HS256')) as Record<string, unknown>
    const userId = typeof payload.userId === 'string' ? payload.userId : null
    if (!userId) return c.json({ error: 'Invalid token' }, 401)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    if (!user) return c.json({ error: 'User not found' }, 404)
    if (user.role !== 'admin') return c.json({ error: 'Forbidden: admin only' }, 403)

    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}