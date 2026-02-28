import { makeAutoObservable, runInAction, action } from 'mobx';
import type { Question, Answer } from '../types/quiz';  

class GameStore {
  // ================== СОСТОЯНИЕ ==================
  gameStatus: 'idle' | 'playing' | 'finished' = 'idle';
  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  correctAnswersCount = 0;
  selectedAnswers: number[] = [];
  essayAnswer: string = '';
  answeredQuestions: Answer[] = [];
  timeLeft = 3000;
  timer: NodeJS.Timeout | null = null;
  sessionId: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true }); 
  }

  // ================== СОЗДАНИЕ СЕССИИ ==================
  async createSession(questionCount = 5, difficulty = 'medium') {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('Нет токена авторизации');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionCount, difficulty }),
      });

      if (!res.ok) {
        throw new Error(`Создание сессии не удалось: ${res.status}`);
      }

      const data = await res.json();

      runInAction(() => {
        this.questions = data.questions || [];
        this.sessionId = data.sessionId;
        this.currentQuestionIndex = 0;
      });
    } catch (err) {
      console.error('Ошибка создания сессии:', err);
    }
  }

  // ================== СТАРТ ИГРЫ ==================
  startGame() {
    if (!this.questions.length) return;

    runInAction(() => {
      this.gameStatus = 'playing';
      this.score = 0;
      this.correctAnswersCount = 0;
      this.currentQuestionIndex = 0;
      this.selectedAnswers = [];
      this.essayAnswer = '';
      this.answeredQuestions = [];
      this.startTimer();
    });
  }

  // ================== ТАЙМЕР ==================
  startTimer() {
    this.stopTimer();
    runInAction(() => { this.timeLeft = 3000; });

    this.timer = setInterval(
      action(() => {
        runInAction(() => {
          this.timeLeft--;
          if (this.timeLeft <= 0) {
            this.stopTimer();
            this.nextQuestion();
          }
        });
      }),
      1000
    );
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // ================== ВЫБОР ОТВЕТОВ ==================
  toggleAnswer(index: number) {
    if (this.selectedAnswers.includes(index)) {
      this.selectedAnswers = this.selectedAnswers.filter(i => i !== index);
    } else {
      this.selectedAnswers = [...this.selectedAnswers, index];
    }
  }

  setEssayAnswer(text: string) {
    this.essayAnswer = text;
  }

  // ================== ОТПРАВКА ОТВЕТА ==================
  async submitCurrentAnswer() {
  if (!this.currentQuestion || !this.sessionId) return;

  const token = localStorage.getItem('auth_token');
  if (!token) return;

  const payload = {
    questionId: this.currentQuestion.id,
    ...(this.currentQuestion.type === 'multiple-select' ? { selectedOptions: this.selectedAnswers } : {}),
    ...(this.currentQuestion.type === 'essay' ? { text: this.essayAnswer.trim() } : {}),
  };

  console.group(`[Ответ на вопрос ${this.currentQuestion.id}]`);
console.log('URL:', `${import.meta.env.VITE_API_URL}/api/sessions/${this.sessionId}/submit`);


if (this.currentQuestion.type === 'multiple-select') {
  const letters = this.selectedAnswers
    .map(i => String.fromCharCode(65 + i))  
    .sort()
    .join(', ') || 'ничего не выбрано';

  console.log(
    '%cОтправляем (multiple-select): %cВарианты: ' + letters,
    'color: #888; font-weight: normal;',
    'color: #4CAF50; font-weight: bold;'
  );

  
  console.log(`Индексы: ${this.selectedAnswers.join(', ') || 'пусто'}`);
} 
else if (this.currentQuestion.type === 'essay') {
  const preview = this.essayAnswer.trim().length > 50 
    ? this.essayAnswer.trim().slice(0, 47) + '...' 
    : this.essayAnswer.trim() || 'пустой текст';

  console.log(
    '%cОтправляем (essay): %c"' + preview + '"',
    'color: #888; font-weight: normal;',
    'color: #2196F3; font-style: italic;'
  );
} 
else {
  console.log('Отправляем:', payload);
}

console.log('Полный payload:', payload);

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/sessions/${this.sessionId}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    console.log('Статус ответа:', res.status);

    const text = await res.text();  
    console.log('Сырой Response:', text);

    let result;
    try {
      result = JSON.parse(text);
      console.log('Parsed JSON:', result);
      console.log('Начислено баллов:', result.pointsEarned ?? 'не пришло');
      console.log('Правильно?', result.isCorrect ?? 'не пришло');
    } catch {
      console.log('Ответ не JSON:', text);
    }

  
  } catch (err) {
    console.error('Ошибка fetch:', err);
  } finally {
    console.groupEnd();
  }
}

  // ================== ПЕРЕХОД К СЛЕДУЮЩЕМУ ВОПРОСУ ==================
async nextQuestion() {
  await this.submitCurrentAnswer();

  runInAction(() => {
    this.selectedAnswers = [];     
    this.essayAnswer = '';          
  });

  if (this.isLastQuestion) {
    await this.finishGame();
    return;
  }

  runInAction(() => {
    this.currentQuestionIndex++;
    this.startTimer();
  });
}

  // ================== ЗАВЕРШЕНИЕ ИГРЫ ==================
async finishGame() {
  if (!this.sessionId) return;

  const token = localStorage.getItem('auth_token');
  if (!token) return;

  try {
    console.log('Завершаем сессию финальным /submit');

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/sessions/${this.sessionId}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),  // пустой body — безопасно
      }
    );

    console.log('Статус финального submit:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Ошибка финального submit:', errorText);
      return;
    }

    const result = await res.json();  // ← читаем ТОЛЬКО ОДИН раз
    console.log('Финализация OK, сервер вернул:', result);

    runInAction(() => {
      // Если сервер вернул финальные баллы — обновляем
      this.score = result.score?.earned ?? this.score;
    });
  } catch (err) {
    console.error('Ошибка сети при финальном submit:', err);
  }

  runInAction(() => {
    this.gameStatus = 'finished';
    this.stopTimer();
    this.sessionId = null;
  });
}

  // ================== СБРОС ==================
  resetGame() {
    this.stopTimer();
    runInAction(() => {
      this.gameStatus = 'idle';
      this.questions = [];
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.correctAnswersCount = 0;
      this.selectedAnswers = [];
      this.essayAnswer = '';
      this.answeredQuestions = [];
      this.sessionId = null;
      this.timeLeft = 30;
    });
  }

  // ================== ГЕТТЕРЫ ==================
  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  get progress(): number {
    return this.questions.length ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100 : 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }
}

export const gameStore = new GameStore();