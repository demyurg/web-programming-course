import { Hono } from 'hono';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { verify } from 'hono/jwt';
import { sessionService } from '../services/sessionService';
import { handleError, throwError } from '../utils/errors';

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
        if (!userId) throwError("Unauthorized");
        
        // Проверяем, что пользователь существует
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) throwError("User not found");
 
        // Получаем и валидируем тело запроса
        const body = await c.req.json().catch(() => ({}));

        // Валидация с обработкой ошибок
        const validated = CreateSessionSchema.parse(body);
        const durationHours = validated.durationHours;
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
        return handleError(c, error); 
    }
});

// POST /api/sessions/:id/answers - добавить ответ
app.post('/:id/answers', async (c) => {
    try {
        // Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) throwError("Unauthorized");

        const { id } = c.req.param();
        const body = await c.req.json();

        // Валидация
                const validatedData = AnswerSchema.parse(body); // Если ошибка - уйдет в catch

        // Проверяем, что сессия принадлежит пользователю
        const session = await prisma.session.findUnique({
            where: { id },
            select: { userId: true, status: true, expiresAt: true }
        });

        if (!session) throwError("Сессия не найдена");

        if (session.userId !== userId) throwError("Доступ запрещен");

        if (session.status !== 'in_progress') throwError("Сессия не активна");

        if (session.expiresAt < new Date()) throwError("Сессия истекла");

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
        return handleError(c, error); // Одна строка для всех ошибок!
    }
});

// GET /api/sessions/:id - получить сессию с ответами
app.get('/:id', async (c) => {
    try {
        // Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) throwError("Unauthorized");
      
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
        return handleError(c, error);
    }
});

// POST /api/sessions/:id/submit - завершить сессию
app.post('/:id/submit', async (c) => {
    try {
        // Проверяем токен
        const userId = await getUserIdFromToken(c);
        if (!userId) throwError("Unauthorized");
        const { id } = c.req.param();

        // Проверяем, что сессия принадлежит пользователю
        const session = await prisma.session.findUnique({
            where: { id },
            select: { userId: true, status: true }
        });

        if (!session) throwError("Session not found");

        if (session.userId !== userId)throwError("Access denied");

        if (session.status !== 'in_progress') throwError("Session is already completed");
        
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

    } catch (error) 
        return handleError(c, error)
    }
});

export default app;