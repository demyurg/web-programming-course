import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';
import { Prisma, PrismaClient } from '@prisma/client';
import { adminAuth } from '../middleware/admin.js';
import { QuestionSchema, GradeSchema } from '../utils/validation.js';

const prisma = new PrismaClient();
const admin = new Hono();

// Применяем middleware ко всем admin роутам
admin.use('*', adminAuth);

// GET /api/admin/questions - Получить все вопросы с информацией
admin.get('/questions', async (c: Context) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        answers: {
          select: {
            id: true,
            score: true,
            createdAt: true,
            session: {
              select: {
                userId: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: {
            answers: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Форматируем ответ с дополнительной статистикой
    const formattedQuestions = questions.map(question => {
      const totalAnswers = question.answers.length;
      const answeredCount = question.answers.filter(a => a.score !== null).length;
      const averageScore = totalAnswers > 0
        ? question.answers.reduce((sum, a) => sum + (a.score || 0), 0) / totalAnswers
        : 0;

      // Парсим correctAnswer если это строка
      let correctAnswer = question.correctAnswer;
      if (typeof correctAnswer === 'string') {
        try {
          correctAnswer = JSON.parse(correctAnswer);
        } catch {
          // Если не парсится, оставляем как есть
        }
      }

      return {
        id: question.id,
        text: question.text,
        type: question.type,
        points: question.points,
        category: question.category,
        correctAnswer: correctAnswer,
        totalAnswers: question._count.answers,
        stats: {
          answeredCount,
          averageScore: Number(averageScore.toFixed(2)),
          completionRate: totalAnswers > 0 
            ? Number(((answeredCount / totalAnswers) * 100).toFixed(2))
            : 0
        },
        createdAt: question.createdAt,
        updatedAt: question.updatedAt
      };
    });

    return c.json({
      success: true,
      questions: formattedQuestions,
      total: formattedQuestions.length
    });

  } catch (error) {
    console.error('Get admin questions error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// POST /api/admin/questions - Создать новый вопрос
admin.post('/questions', async (c: Context) => {
  try {
    const body = await c.req.json();
    
    const validationResult = QuestionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return c.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.issues
      }, 400);
    }

    const { text, type, points, categoryId, correctAnswer } = validationResult.data;

    // Проверяем существование категории
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return c.json({
        success: false,
        error: 'Category not found',
        message: 'Category with provided ID does not exist'
      }, 404);
    }

    // Подготавливаем данные для создания
    const questionData: any = {
      text,
      type,
      points,
      categoryId,
    };

    // Добавляем correctAnswer только если он есть
    if (correctAnswer !== undefined) {
      questionData.correctAnswer = JSON.stringify(correctAnswer);
    }

    // Создаем вопрос
    const question = await prisma.question.create({
      data: questionData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Парсим correctAnswer для ответа
    let parsedCorrectAnswer = question.correctAnswer;
    if (typeof parsedCorrectAnswer === 'string') {
      try {
        parsedCorrectAnswer = JSON.parse(parsedCorrectAnswer);
      } catch {
        // Если не парсится, оставляем как есть
      }
    }

    return c.json({
      success: true,
      question: {
        id: question.id,
        text: question.text,
        type: question.type,
        points: question.points,
        category: question.category,
        correctAnswer: parsedCorrectAnswer,
        createdAt: question.createdAt
      }
    }, 201);

  } catch (error) {
    console.error('Create question error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// PUT /api/admin/questions/:id - Обновить вопрос
admin.put('/questions/:id', async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    // Проверяем существование вопроса
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    });

    if (!existingQuestion) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: 'Question not found'
      }, 404);
    }

    const validationResult = QuestionSchema.partial().safeParse(body);
    
    if (!validationResult.success) {
      return c.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.issues
      }, 400);
    }

    const { text, type, points, categoryId, correctAnswer } = validationResult.data;

    // Если обновляется категория, проверяем ее существование
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return c.json({
          success: false,
          error: 'Category not found',
          message: 'Category with provided ID does not exist'
        }, 404);
      }
    }

    // Подготавливаем данные для обновления
    const updateData: any = {};
    
    if (text !== undefined) updateData.text = text;
    if (type !== undefined) updateData.type = type;
    if (points !== undefined) updateData.points = points;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (correctAnswer !== undefined) updateData.correctAnswer = JSON.stringify(correctAnswer);

    // Обновляем вопрос
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Парсим correctAnswer для ответа
    let parsedCorrectAnswer = updatedQuestion.correctAnswer;
    if (typeof parsedCorrectAnswer === 'string') {
      try {
        parsedCorrectAnswer = JSON.parse(parsedCorrectAnswer);
      } catch {
        // Если не парсится, оставляем как есть
      }
    }

    return c.json({
      success: true,
      question: {
        id: updatedQuestion.id,
        text: updatedQuestion.text,
        type: updatedQuestion.type,
        points: updatedQuestion.points,
        category: updatedQuestion.category,
        correctAnswer: parsedCorrectAnswer,
        updatedAt: updatedQuestion.updatedAt
      }
    });

  } catch (error) {
    console.error('Update question error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// GET /api/admin/answers/pending - Получить непроверенные essay ответы
admin.get('/answers/pending', async (c: Context) => {
  try {
    const pendingAnswers = await prisma.answer.findMany({
      where: {
        score: null,
        question: {
          type: 'essay'
        }
      },
      include: {
        session: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        question: {
          select: {
            id: true,
            text: true,
            points: true,
            correctAnswer: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const formattedAnswers = pendingAnswers.map(answer => {
      // Парсим userAnswer если это строка
      let userAnswer = answer.userAnswer;
      if (typeof userAnswer === 'string') {
        try {
          userAnswer = JSON.parse(userAnswer);
        } catch {
          // Если не парсится, оставляем как есть
        }
      }

      return {
        id: answer.id,
        userAnswer: userAnswer,
        session: {
          id: answer.session.id,
          status: answer.session.status,
          startedAt: answer.session.startedAt,
          user: answer.session.user
        },
        question: answer.question,
        submittedAt: answer.createdAt
      };
    });

    return c.json({
      success: true,
      pendingAnswers: formattedAnswers,
      total: formattedAnswers.length
    });

  } catch (error) {
    console.error('Get pending answers error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// POST /api/admin/answers/:id/grade - Выставить оценку за essay
admin.post('/answers/:id/grade', async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const validationResult = GradeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return c.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.issues
      }, 400);
    }

    const { criterion, points, feedback } = validationResult.data;

    // Используем транзакцию для обновления ответа и сессии
    const result = await prisma.$transaction(async (tx) => {
      // Находим ответ
      const answer = await tx.answer.findUnique({
        where: { id },
        include: {
          session: {
            include: {
              answers: {
                where: {
                  question: {
                    type: 'essay'
                  }
                }
              }
            }
          },
          question: true
        }
      });

      if (!answer) {
        throw new Error('Answer not found');
      }

      if (answer.score !== null) {
        throw new Error('Answer already graded');
      }

      if (answer.question.type !== 'essay') {
        throw new Error('Can only grade essay answers');
      }

      // Обновляем ответ с оценкой
      const updatedAnswer = await tx.answer.update({
        where: { id },
        data: {
          score: points,
        }
      });

      // Проверяем, все ли essay ответы в сессии проверены
      const sessionAnswers = await tx.answer.findMany({
        where: {
          sessionId: answer.sessionId,
          question: {
            type: 'essay'
          }
        }
      });

      const allEssaysGraded = sessionAnswers.every(a => a.score !== null);

      // Если все essay ответы проверены, обновляем общий счет сессии
      if (allEssaysGraded) {
        // Получаем все ответы сессии (включая multiple-select)
        const allSessionAnswers = await tx.answer.findMany({
          where: {
            sessionId: answer.sessionId
          }
        });

        const totalScore = allSessionAnswers.reduce((sum, a) => sum + (a.score || 0), 0);

        await tx.session.update({
          where: { id: answer.sessionId },
          data: { 
            score: totalScore,
            // Если все ответы проверены и сессия еще не завершена, завершаем ее
            ...(answer.session.status === 'in_progress' && {
              status: 'completed',
              completedAt: new Date()
            })
          }
        });
      }

      return updatedAnswer;
    });

    return c.json({
      success: true,
      message: 'Answer graded successfully',
      answer: {
        id: result.id,
        score: result.score,
        gradedAt: result.updatedAt
      }
    });

  } catch (error) {
    console.error('Grade answer error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Answer not found') {
        return c.json({
          success: false,
          error: 'Not Found',
          message: error.message
        }, 404);
      }
      
      if (error.message === 'Answer already graded' || error.message === 'Can only grade essay answers') {
        return c.json({
          success: false,
          error: 'Bad Request',
          message: error.message
        }, 400);
      }
    }
    
    return c.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// GET /api/admin/students/:userId/stats - Получить статистику студента
admin.get('/students/:userId/stats', async (c: Context) => {
  try {
    const { userId } = c.req.param();

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sessions: {
          where: {
            status: 'completed'
          },
          include: {
            answers: true
          },
          orderBy: {
            completedAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: 'Student not found'
      }, 404);
    }

    const completedSessions = user.sessions;

    // Рассчитываем статистику
    const totalSessions = completedSessions.length;
    
    if (totalSessions === 0) {
      return c.json({
        success: true,
        stats: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          totalSessions: 0,
          averageScore: null,
          bestScore: null,
          worstScore: null,
          recentSessions: []
        }
      });
    }

    const scores = completedSessions
      .map(s => s.score || 0)
      .filter(score => score > 0);

    const averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Получаем последние 5 сессий
    const recentSessions = completedSessions.slice(0, 5).map(session => ({
      id: session.id,
      score: session.score,
      completedAt: session.completedAt,
      totalAnswers: session.answers?.length || 0
    }));

    return c.json({
      success: true,
      stats: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        totalSessions,
        averageScore: Number(averageScore.toFixed(2)),
        bestScore,
        worstScore,
        recentSessions
      }
    });

  } catch (error) {
    console.error('Get student stats error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default admin;