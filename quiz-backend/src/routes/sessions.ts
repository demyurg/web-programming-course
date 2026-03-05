import { Hono } from 'hono';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { verify } from 'hono/jwt';
import { sessionService } from '../services/sessionService';

const prisma = new PrismaClient();
const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-change-in-production';

// Схемы валидации
const CreateSessionSchema = z.object({
    durationHours: z.number().min(0.5).max(24).optional().default(1)
});

const AnswerSchema = z.object({
    questionId: z.string().uuid(),
    userAnswer: z.union([
        z.string(),
        z.array(z.string())
    ])
});

// Вспомогательная функция для проверки токена и получения userId
async function getUserIdFromToken(c: any): Promise<string | null> {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = await verify(token, JWT_SECRET, 'HS256');
        return payload.userId as string;
    } catch {
        return null;
    }
}

// POST /api/sessions - создать новую сессию
app.post('/', async (c) => {
    try {
        // Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Проверяем, что пользователь существует
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Получаем и валидируем тело запроса
        const body = await c.req.json().catch(() => ({}));

        // Валидация с обработкой ошибок
        let durationHours = 1;
        try {
            const validated = CreateSessionSchema.parse(body);
            durationHours = validated.durationHours;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return c.json({
                    error: 'Validation failed',
                    details: error.format()
                }, 400);
            }
            throw error;
        }

        // Создаем сессию
        const session = await sessionService.createSession(userId, durationHours);

        // Получаем количество вопросов
        const questionsCount = await prisma.question.count();

        return c.json({
            session: {
                id: session.id,
                status: session.status,
                expiresAt: session.expiresAt,
                startedAt: session.startedAt,
                totalQuestions: questionsCount
            }
        }, 201);

    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        console.error('Session creation error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// POST /api/sessions/:id/answers - добавить ответ
app.post('/:id/answers', async (c) => {
    try {
        // Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const { id } = c.req.param();
        const body = await c.req.json();

        // Валидация
        let validatedData;
        try {
            validatedData = AnswerSchema.parse(body);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return c.json({
                    error: 'Validation failed',
                    details: error.format()
                }, 400);
            }
            throw error;
        }

        // Проверяем, что сессия принадлежит пользователю
        const session = await prisma.session.findUnique({
            where: { id },
            select: { userId: true, status: true, expiresAt: true }
        });

        if (!session) {
            return c.json({ error: 'Session not found' }, 404);
        }

        if (session.userId !== userId) {
            return c.json({ error: 'Access denied' }, 403);
        }

        if (session.status !== 'in_progress') {
            return c.json({ error: 'Session is not active' }, 400);
        }

        if (session.expiresAt < new Date()) {
            return c.json({ error: 'Session has expired' }, 400);
        }

        // Добавляем ответ
        const answer = await sessionService.submitAnswer(
            id,
            validatedData.questionId,
            validatedData.userAnswer
        );

        // Парсим ответ для отправки
        const userAnswer = typeof answer.userAnswer === 'string'
            ? JSON.parse(answer.userAnswer)
            : answer.userAnswer;

        return c.json({
            answer: {
                id: answer.id,
                questionId: answer.questionId,
                userAnswer,
                score: answer.score,
                isCorrect: answer.isCorrect,
                createdAt: answer.createdAt
            }
        }, 201);

    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        console.error('Answer submission error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// GET /api/sessions/:id - получить сессию с ответами
app.get('/:id', async (c) => {
    try {
        // Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const { id } = c.req.param();

        // Получаем сессию через сервис
        const session = await sessionService.getSession(id, userId);

        // Форматируем ответы
        const answers = session.answers.map(answer => {
            let userAnswer = answer.userAnswer;
            // Парсим если это строка
            if (typeof userAnswer === 'string') {
                try {
                    userAnswer = JSON.parse(userAnswer);
                } catch {
                    // Оставляем как есть если не парсится
                }
            }

            return {
                id: answer.id,
                questionId: answer.questionId,
                question: answer.question,
                userAnswer,
                score: answer.score,
                isCorrect: answer.isCorrect,
                createdAt: answer.createdAt
            };
        });

        return c.json({
            session: {
                id: session.id,
                status: session.status,
                score: session.score,
                startedAt: session.startedAt,
                expiresAt: session.expiresAt,
                completedAt: session.completedAt,
                answers
            }
        });

    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 404);
        }
        console.error('Get session error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// POST /api/sessions/:id/submit - завершить сессию
app.post('/:id/submit', async (c) => {
    try {
        // Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const { id } = c.req.param();

        // Проверяем, что сессия принадлежит пользователю
        const session = await prisma.session.findUnique({
            where: { id },
            select: { userId: true, status: true }
        });

        if (!session) {
            return c.json({ error: 'Session not found' }, 404);
        }

        if (session.userId !== userId) {
            return c.json({ error: 'Access denied' }, 403);
        }

        if (session.status !== 'in_progress') {
            return c.json({ error: 'Session is already completed' }, 400);
        }

        // Завершаем сессию
        const completedSession = await sessionService.submitSession(id);

        return c.json({
            session: {
                id: completedSession.id,
                status: completedSession.status,
                score: completedSession.score,
                completedAt: completedSession.completedAt
            }
        });

    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        console.error('Submit session error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export default app;