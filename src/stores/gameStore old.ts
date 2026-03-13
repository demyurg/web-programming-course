import { makeAutoObservable, runInAction } from "mobx";
import type { QuestionPreview } from "../../generated/api/quizBattleAPI.schemas";
import { mockQuestions } from "../data/questions";

// Локальный тип вопроса для внутреннего использования
export interface LocalQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswers: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LocalAnswer {
  questionId: string;
  selectedAnswers: number[];
  isCorrect: boolean;
  pointsEarned: number;
}

class GameStore {
  gameStatus: "idle" | "playing" | "finished" = "idle";
  questions: LocalQuestion[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers: number[] = [];
  answeredQuestions: LocalAnswer[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Преобразование вопросов из API формата во внутренний
  setQuestionsFromAPI(questions: QuestionPreview[]) {
   
    this.questions = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options || [],
      correctAnswers: [], // API не возвращает правильные ответы в preview
      difficulty: q.difficulty
    }));

    console.log('All questions loaded:', {
      total: questions.length,
      multipleSelect: questions.filter(q => q.type === 'multiple-select').length,
      essay: questions.filter(q => q.type === 'essay').length
    });

    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
    this.score = 0;
  }
  
  // Запуск игры с mock данными (fallback)
  startGame() {
    this.gameStatus = "playing";
    // Если вопросы не загружены из API, используем mock
    if (this.questions.length === 0) {
      this.questions = mockQuestions;
    }
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
    this.score = 0;
  }

  // Множественный выбор ответов
  toggleAnswer(index: number) {
    if (this.gameStatus !== "playing") return;

    if (this.selectedAnswers.includes(index)) {
      this.selectedAnswers = this.selectedAnswers.filter(i => i !== index);
    } else {
      this.selectedAnswers = [...this.selectedAnswers, index];
    }
  }

  // Сохранение текущего ответа (локально)
  saveCurrentAnswer() {
    const question = this.currentQuestion;
    if (!question || this.selectedAnswers.length === 0) return;

    // Удаляем предыдущий ответ на этот вопрос если есть
    this.answeredQuestions = this.answeredQuestions.filter(
      a => a.questionId !== question.id
    );

    this.answeredQuestions.push({
      questionId: question.id,
      selectedAnswers: [...this.selectedAnswers],
      isCorrect: false, // будет обновлено после ответа от API
      pointsEarned: 0
    });
  }

  // Принудительное сохранение ответа (для последнего вопроса)
  // Улучшенный метод forceSaveCurrentAnswer
  forceSaveCurrentAnswer() {
    console.log('🔄 Force saving answer...');
    console.log('Current question:', this.currentQuestion);
    console.log('Selected answers:', this.selectedAnswers);

    const question = this.currentQuestion;
    if (!question) {
      console.log('❌ No current question');
      return;
    }

    if (this.selectedAnswers.length === 0) {
      console.log('❌ No selected answers');
      return;
    }

    if (!question) return;

    // Проверяем, не сохранили ли уже ответ на этот вопрос
    const alreadyAnswered = this.answeredQuestions.some(a => a.questionId === question.id);

    if (!alreadyAnswered && this.selectedAnswers.length > 0) {
      this.answeredQuestions.push({
        questionId: question.id,
        selectedAnswers: [...this.selectedAnswers],
        isCorrect: false,
        pointsEarned: 0
      });
      console.log('Force saved answer for question:', question.id);
    }
  }

  // Обновление результата после ответа от API
  // В gameStore.ts
  updateAnswerResult(questionId: string, isCorrect: boolean, pointsEarned: number) {
    console.log('🔄 UPDATE ANSWER RESULT:', {
      questionId,
      isCorrect,
      pointsEarned,
      currentScore: this.score
    });

    const answerIndex = this.answeredQuestions.findIndex(a => a.questionId === questionId);
    console.log('Found answer at index:', answerIndex);

    if (answerIndex !== -1) {
      this.answeredQuestions[answerIndex].isCorrect = isCorrect;
      this.answeredQuestions[answerIndex].pointsEarned = pointsEarned;

      if (isCorrect) {
        this.score += pointsEarned;
        console.log('✅ Score updated:', this.score);
      }
    } else {
      console.log('❌ Answer not found for question:', questionId);
    }
  }

  updateScoreFromServer(newScore: number) {
    runInAction(() => {
      this.score = newScore;
      console.log('Score updated from server:', newScore);
    });
  }

  // Добавьте этот метод в GameStore
  updateAnswerStatusFromServer(questionId: string, isCorrect: boolean, pointsEarned: number) {
    runInAction(() => {
      console.log('🔄 UPDATE ANSWER STATUS FROM SERVER:', {
        questionId,
        isCorrect,
        pointsEarned
      });

      const answerIndex = this.answeredQuestions.findIndex(a => a.questionId === questionId);
      console.log('Found answer at index:', answerIndex);

      if (answerIndex !== -1) {
        // Обновляем статус и баллы
        this.answeredQuestions[answerIndex].isCorrect = isCorrect;
        this.answeredQuestions[answerIndex].pointsEarned = pointsEarned;

        console.log('✅ Answer status updated');
        console.log('Correct answers after update:', this.correctAnswersCount);
      } else {
        console.log('❌ Answer not found for question:', questionId);
      }
    });
  }

  // Переход к следующему вопросу
  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswers = [];
    } else {
      this.finishGame();
    }
  }

  finishGame() {
    console.log('🏁 FINISHING GAME - Final stats:', {
      totalQuestions: this.questions.length,
      answered: this.answeredQuestions.length,
      correct: this.correctAnswersCount,
      score: this.score
    });
    this.gameStatus = "finished";
  }

  resetGame() {
    this.gameStatus = "idle";
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
  }

  // Computed properties
  get currentQuestion(): LocalQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    return this.questions.length
      ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100
      : 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    const count = this.answeredQuestions.filter(a => a.isCorrect).length;
    console.log('Correct answers computed:', count, 'from', this.answeredQuestions.length);
    return count;
  }

  get isAnswerSelected(): boolean {
    return this.selectedAnswers.length > 0;
  }
}

export const gameStore = new GameStore();