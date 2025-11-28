import { makeAutoObservable } from 'mobx';
import { Question, Answer } from '../types/quiz';
import { mockQuestions } from '../data/questions';

/**
 * GameStore - MobX Store для управления игровой логикой
 *
 * Используется в Task2 и Task4
 */
class GameStore {
  // Observable состояние
  gameStatus: 'idle' | 'playing' | 'finished' = 'idle';

  // TODO: Добавьте другие поля состояния:
  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers: number[] = [];
  answeredQuestions: Answer[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Actions - методы для изменения состояния

  startGame() {
    this.gameStatus = 'playing';
    // TODO: Добавьте остальную логику:
    // - Загрузите вопросы из mockQuestions
    // - Сбросьте счётчики и индексы
    this.questions = [...mockQuestions];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
  }

  selectAnswer(answerIndex: number) {
    console.log('Selected answer:', answerIndex);
    // TODO: Реализуйте логику выбора ответа:
    // 1. Проверьте, что ответ еще не был выбран
    // 2. Сохраните выбранный ответ
    // 3. Проверьте правильность (сравните с correctAnswer)
    // 4. Увеличьте счёт если правильно
    // 5. Сохраните в историю ответов
    if (this.selectedAnswers !== null || this.gameStatus !== 'playing') {
      return;
    }
    this.selectedAnswers = [answerIndex];

    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return;

    // Проверяем правильность ответа
    
const isCorrect = currentQuestion.correctAnswer.includes(answerIndex);
    if (isCorrect) {
      this.score += this.getPointsForDifficulty(currentQuestion.difficulty);
    }

    // Сохраняем в историю ответов
    this.answeredQuestions.push({
      questionId: currentQuestion.id,  // <-- Добавил ! для non-null
      selectedAnswer: [answerIndex],
      isCorrect: isCorrect
    });
  }

  // НОВЫЙ МЕТОД: toggleAnswer - для множественного выбора (чекбоксы)
  toggleAnswer(answerIndex: number) {
    // Проверяем, что игра в процессе
    if (this.gameStatus !== 'playing') {
      return;
    }

    // Если индекс уже выбран — удаляем его (toggle off)
    if (this.selectedAnswers.includes(answerIndex)) {
      this.selectedAnswers = this.selectedAnswers.filter(id => id !== answerIndex);
    } else {
      // Иначе добавляем (toggle on)
      this.selectedAnswers = [...this.selectedAnswers, answerIndex];
    }
  }

  // НОВЫЙ МЕТОД: setQuestionsFromAPI (для загрузки вопросов из API)
  setQuestionsFromAPI(apiQuestions: Question[]) {
    this.questions = [...apiQuestions];  // Иммутабельно копируем из API
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
    this.gameStatus = 'playing';  // Автоматически запускаем игру
  }

  // TODO: Добавьте другие методы:
  // nextQuestion() - переход к следующему вопросу
  // finishGame() - завершение игры
  // resetGame() - сброс к начальным значениям
  nextQuestion() {
    if (this.isLastQuestion) {
      this.finishGame();
      return;
    }

    this.currentQuestionIndex++;
    this.selectedAnswers = [];
  }

  // НОВЫЙ МЕТОД: saveCurrentAnswer (сохраняет текущий выбор в историю, до проверки сервера)
  saveCurrentAnswer() {
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion || this.selectedAnswers.length === 0) return;

    // Сохраняем как массив (теперь тип Answer поддерживает number[])
    this.answeredQuestions.push({
      questionId: currentQuestion!.id,
      selectedAnswer: [...this.selectedAnswers],  
      isCorrect: false
    });
  }

  finishGame() {
    this.gameStatus = 'finished';
  }

  resetGame() {
    this.gameStatus = 'idle';
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
  }

  // НОВЫЙ МЕТОД: updateAnswerResult (обновляет результат и счёт из API)
  updateAnswerResult(isCorrect: boolean, pointsEarned: number) {
    // Обновляем последний ответ в истории
    const lastAnswerIndex = this.answeredQuestions.length - 1;
    if (lastAnswerIndex >= 0) {
      this.answeredQuestions[lastAnswerIndex].isCorrect = isCorrect;
    }
    // Добавляем очки, если правильно
    if (isCorrect) {
      this.score += pointsEarned;
    }
  }

  // Вспомогательный метод для получения очков за сложность
  private getPointsForDifficulty(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 10;
    }
  }

  // Computed values - вычисляемые значения

  get currentQuestion(): Question | null {
    // TODO: Верните текущий вопрос из массива questions
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    // TODO: Вычислите прогресс в процентах (0-100)
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  // TODO: Добавьте другие computed values:
  // get isLastQuestion(): boolean
  // get correctAnswersCount(): number

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter(answer => answer.isCorrect).length;
  }
}

export const gameStore = new GameStore();