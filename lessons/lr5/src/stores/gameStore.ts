import { makeAutoObservable, action } from 'mobx';
import { Question, Answer } from '../types/quiz';
import apiClient from '../api/client';

/**
 * GameStore - MobX Store для управления игровой логикой
 *
 * Используется в Task2 и Task4
 */
class GameStore {
  // Observable состояние
  gameStatus: 'idle' | 'loading' | 'playing' | 'finished' = 'idle';
  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers: number[] = [];
  essayAnswer: string = '';
  answeredQuestions: Answer[] = [];
  sessionId: string | null = null;
  totalQuestions: number = 15; // Всего 15 вопросов, как в задании
  multipleSelectCount: number = 13; // 13 тестовых вопросов
  essayCount: number = 2; // 2 текстовых вопроса

 constructor() {
    makeAutoObservable(this);
  }

  // Actions - методы для изменения состояния

  startGame = action(async () => {
    this.gameStatus = 'loading';
    
    try {
      // Создаем новую игровую сессию через API
      const response = await apiClient.post('/api/sessions', {
        questionCount: this.totalQuestions
      });
      
      this.sessionId = response.data.sessionId;
      this.questions = response.data.questions;
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.selectedAnswers = [];
      this.essayAnswer = '';
      this.answeredQuestions = [];
      this.gameStatus = 'playing';
    } catch (error) {
      console.error('Ошибка при создании сессии:', error);
      this.gameStatus = 'idle';
    }
  });

  toggleAnswer = action((answerIndex: number) => {
    // Проверим, есть ли уже этот индекс в массиве
    const index = this.selectedAnswers.indexOf(answerIndex);
    if (index > -1) {
      // Если есть, удаляем его (переключаем с выбора)
      this.selectedAnswers = this.selectedAnswers.filter((_, i) => i !== index);
    } else {
      // Если нет, добавляем его
      this.selectedAnswers = [...this.selectedAnswers, answerIndex];
    }
 })

 selectAnswer = action((answerIndex: number) => {
    // Для совместимости с существующим кодом, используем toggleAnswer
    this.toggleAnswer(answerIndex);
  })

  updateEssayAnswer = action((answer: string) => {
    this.essayAnswer = answer;
  })

  // Другие методы:
  nextQuestion = action(async () => {
    if (this.gameStatus !== 'playing') return;

    const currentQuestion = this.currentQuestion;
    if (currentQuestion && this.sessionId) {
      try {
        // Отправляем ответ на текущий вопрос через API
        const answerData: any = {
          questionId: currentQuestion.id
        };

        if (currentQuestion.type === 'essay') {
          // Для essay вопросов отправляем текст ответа
          answerData.text = this.essayAnswer;
        } else {
          // Для multiple-select отправляем выбранные варианты
          answerData.selectedOptions = this.selectedAnswers;
        }

        // Отправляем ответ и получаем результат проверки
        const response = await apiClient.post(`/api/sessions/${this.sessionId}/answers`, answerData);

        // Добавляем ответ в локальный массив с информацией о правильности
        this.answeredQuestions.push({
          questionId: currentQuestion.id,
          selectedAnswer: currentQuestion.type === 'essay' ? this.essayAnswer : this.selectedAnswers,
          isCorrect: response.data.status === 'correct' || response.data.status === 'partial',
          pointsAwarded: response.data.pointsEarned || 0
        });

        if (this.isLastQuestion) {
          await this.finishGame();
        } else {
          this.currentQuestionIndex += 1;
          this.selectedAnswers = [];
          this.essayAnswer = '';
        }
      } catch (error) {
        console.error('Ошибка при отправке ответа:', error);
      }
    }
 });

  // Вспомогательная функция для определения баллов по сложности вопроса
  private getPointsForDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      default: return 1;
    }
  }

  finishGame = action(async () => {
    if (this.sessionId) {
      try {
        await apiClient.post(`/api/sessions/${this.sessionId}/submit`);
        // Получаем результаты сессии
        const response = await apiClient.get(`/api/sessions/${this.sessionId}/results`);
        this.score = response.data.score.earned;
      } catch (error) {
        console.error('Ошибка при завершении сессии:', error);
      }
    }
    this.gameStatus = 'finished';
  });

  resetGame = action(() => {
    this.gameStatus = 'idle';
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.essayAnswer = '';
    this.answeredQuestions = [];
    this.sessionId = null;
  });

  // Computed values - вычисляемые значения

  get currentQuestion(): Question | null {
    // Верните текущий вопрос из массива questions
    if (this.questions.length === 0) return null;
    return this.questions[this.currentQuestionIndex] || null;
  }

 get progress(): number {
    // Вычислите прогресс в процентах (0-100)
    if (this.questions.length === 0) return 0;
    return (this.currentQuestionIndex / this.questions.length) * 100;
  }

 // Другие computed values:
 get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter(answer => answer.isCorrect).length;
  }
}

export const gameStore = new GameStore();