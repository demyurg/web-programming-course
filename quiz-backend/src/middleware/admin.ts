import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-change-in-production';

export async function requireAdmin(c: Context, next: Next) {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        // Проверяем JWT токен
        const payload = await verify(token, JWT_SECRET, 'HS256');

        // Получаем пользователя из БД
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { id: true, role: true, name: true, email: true }
        });

        if (!user) {
            return c.json({ error: 'User not found' }, 401);
        }

        if (user.role !== 'admin') {
            return c.json({ error: 'Forbidden - Admin access required' }, 403);
        }

        c.set('user', user);

        await next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return c.json({ error: 'Invalid or expired token' }, 401);
    }
}