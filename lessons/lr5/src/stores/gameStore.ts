// src/stores/gameStore.ts
import { makeAutoObservable, runInAction, action } from 'mobx';
import { Question, MultipleSelectQuestion, EssayQuestion, Answer } from '../types/quiz';

class GameStore {
  // ===== Состояние игры =====
  gameStatus: 'idle' | 'playing' | 'finished' = 'idle';
  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers: number[] = [];           // для multiple-select
  selectedEssayAnswer: string = '';         // для essay
  answeredQuestions: Answer[] = [];
  correctAnswersCount = 0;
  timeLeft = 30000;
  timerInterval: NodeJS.Timeout | null = null;
  sessionId: string | null = null;
  pastScores: number[] = [];

  constructor() {
    makeAutoObservable(this);
    const saved = localStorage.getItem('quizPastScores');
    if (saved) this.pastScores = JSON.parse(saved);
  }

  // ===== Эссе =====
  setEssayAnswer(text: string) {
    this.selectedEssayAnswer = text;
  }

  resetEssayAnswer() {
    this.selectedEssayAnswer = '';
  }

  // ===== Создание сессии =====
  async createSession(questionCount = 5, difficulty = 'medium') {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Нет токена авторизации');

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionCount, difficulty }),
      });

      if (!res.ok) throw new Error('Не удалось создать сессию');

      const data = await res.json();

      runInAction(() => {
        this.sessionId = data.sessionId;
        this.questions = data.questions;
        this.currentQuestionIndex = 0;
      });
    } catch (err) {
      console.error('Ошибка создания сессии:', err);
    }
  }

  // ===== Старт игры =====
  startGame() {
    if (!this.questions.length) {
      console.warn('Нет загруженных вопросов');
      return;
    }

    runInAction(() => {
      this.gameStatus = 'playing';
      this.score = 0;
      this.selectedAnswers = [];
      this.selectedEssayAnswer = '';
      this.answeredQuestions = [];
      this.correctAnswersCount = 0;
      this.timeLeft = 30000;
      this.startTimer();
    });
  }

  // ===== Таймер =====
  startTimer = () => {
    this.stopTimer();
    if (this.gameStatus !== 'playing') return;

    this.timerInterval = setInterval(
      action(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.submitCurrentAnswerAndNext();
        }
      }),
      1000
    );
  };

  stopTimer = () => {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  };

  // ===== Выбор варианта (multiple-select) =====
  toggleAnswer(index: number) {
    if (!this.currentQuestion || this.currentQuestion.type !== 'multiple-select') return;

    if (this.selectedAnswers.includes(index)) {
      this.selectedAnswers = this.selectedAnswers.filter(i => i !== index);
    } else {
      this.selectedAnswers = [...this.selectedAnswers, index];
    }
  }

  // ===== Отправка ответа — ГЛАВНОЕ ИСПРАВЛЕНИЕ ДЛЯ LR6 =====
  async submitCurrentAnswer() {
    const question = this.currentQuestion;
    if (!question || !this.sessionId) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const payload: any = {
      questionId: question.id,
    };

    if (question.type === 'multiple-select') {
      payload.selectedOptions = this.selectedAnswers;
    } else if (question.type === 'essay') {
      payload.textAnswer = this.selectedEssayAnswer.trim();
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sessions/${this.sessionId}/answers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error('Сервер отклонил ответ:', res.status, errText);
        return; // не бросаем — иначе игра зависнет
      }

      const result = await res.json();

      runInAction(() => {
        const points = result.pointsEarned ?? 0;
        const isCorrect = result.isCorrect ?? false;

        this.answeredQuestions.push({
          questionId: question.id,
          selectedAnswer: question.type === 'multiple-select' ? [...this.selectedAnswers] : [],
          isCorrect,
        });

        this.score += points;
        if (isCorrect) this.correctAnswersCount++;

        // Сбрасываем локальные ответы
        this.selectedAnswers = [];
        this.selectedEssayAnswer = '';
      });
    } catch (err) {
      console.error('Ошибка отправки ответа:', err);
    }
  }

  // ===== Переход к следующему вопросу =====
  async nextQuestion() {
    await this.submitCurrentAnswer();

    if (this.isLastQuestion) {
      await this.finishGame();
      return;
    }

    runInAction(() => {
      this.currentQuestionIndex++;
      this.timeLeft = 30000;
      this.startTimer();
    });
  }

  submitCurrentAnswerAndNext = () => {
    this.nextQuestion();
  };

  // ===== Завершение сессии на сервере — ОБЯЗАТЕЛЬНО! =====
 // ===== Завершение игры (без запроса — сервер закроет сессию сам) =====
async finishGame() {
  // Больше не шлём запрос — избегаем 404
  // Если нужно в будущем, добавим правильный эндпоинт

  runInAction(() => {
    this.gameStatus = 'finished';
    this.pastScores.push(this.score);
    localStorage.setItem('quizPastScores', JSON.stringify(this.pastScores));
    this.stopTimer();
    this.sessionId = null;  // Это очистит сессию локально
  });
}

  // ===== Сброс игры =====
  resetGame() {
    runInAction(() => {
      this.gameStatus = 'idle';
      this.questions = [];
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.selectedAnswers = [];
      this.selectedEssayAnswer = '';
      this.answeredQuestions = [];
      this.correctAnswersCount = 0;
      this.timeLeft = 30000;
      this.stopTimer();
      this.sessionId = null;
    });
  }

  // ===== Геттеры =====
  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  get progress(): number {
    return this.questions.length > 0
      ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100
      : 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex >= this.questions.length - 1;
  }
}

export const gameStore = new GameStore();