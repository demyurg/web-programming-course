import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { verify } from 'hono/jwt';

const prisma = new PrismaClient();
const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-change-in-production';

// GET /api/questions - получить все вопросы (без правильных ответов)
app.get('/', async (c) => {
    try {
        // Проверяем авторизацию
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const token = authHeader.split(' ')[1];
        try {
            await verify(token, JWT_SECRET, 'HS256');
        } catch {
            return c.json({ error: 'Invalid token' }, 401);
        }

        // Получаем параметры фильтрации
        const { category, type } = c.req.query();

        const where: any = {};
        if (category) where.categoryId = category;
        if (type) where.type = type;

        // Получаем вопросы без correctAnswer
        const questions = await prisma.question.findMany({
            where,
            select: {
                id: true,
                text: true,
                type: true,
                points: true,
                categoryId: true,
                createdAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
                // correctAnswer не включаем!
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return c.json({ questions });

    } catch (error) {
        console.error('Error fetching questions:', error);
        return c.json({ error: 'Failed to fetch questions' }, 500);
    }
});

// GET /api/questions/categories - получить все категории
app.get('/categories', async (c) => {
    try {
        // Проверяем авторизацию
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const token = authHeader.split(' ')[1];
        try {
            await verify(token, JWT_SECRET, 'HS256');
        } catch {
            return c.json({ error: 'Invalid token' }, 401);
        }

        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return c.json({ categories });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return c.json({ error: 'Failed to fetch categories' }, 500);
    }
});

// GET /api/questions/:id - получить конкретный вопрос
app.get('/:id', async (c) => {
    try {
        // Проверяем авторизацию
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const token = authHeader.split(' ')[1];
        try {
            await verify(token, JWT_SECRET, 'HS256');
        } catch {
            return c.json({ error: 'Invalid token' }, 401);
        }

        const { id } = c.req.param();

        const question = await prisma.question.findUnique({
            where: { id },
            select: {
                id: true,
                text: true,
                type: true,
                points: true,
                categoryId: true,
                createdAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
                // correctAnswer не включаем!
            }
        });

        if (!question) {
            return c.json({ error: 'Question not found' }, 404);
        }

        return c.json({ question });

    } catch (error) {
        console.error('Error fetching question:', error);
        return c.json({ error: 'Failed to fetch question' }, 500);
    }
});

export default app;