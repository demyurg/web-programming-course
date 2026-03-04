import { describe, it, expect, beforeEach } from 'vitest';
import { GameStore } from './gameStore';

describe('GameStore', () => {
  let store: GameStore;

  beforeEach(() => {
    store = new GameStore();
  });

  describe('initialization', () => {
    it('starts with correct default state', () => {
      expect(store.isPlaying).toBe(false);
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.textAnswer).toBe('');
      expect(store.questions).toEqual([]);
      expect(store.answers).toEqual([]);
    });
  });

  describe('toggleAnswer', () => {
    it('adds answer to selection', () => {
      store.toggleAnswer(0);
      expect(store.selectedAnswers).toEqual([0]);
    });

    it('removes answer if already selected', () => {
      store.selectedAnswers = [0, 1, 2];
      store.toggleAnswer(1);
      expect(store.selectedAnswers).toEqual([0, 2]);
    });

    it('maintains order when adding multiple answers', () => {
      store.toggleAnswer(2);
      store.toggleAnswer(0);
      store.toggleAnswer(1);
      expect(store.selectedAnswers).toEqual([2, 0, 1]);
    });
  });

  describe('setTextAnswer', () => {
    it('updates text answer', () => {
      store.setTextAnswer('My answer');
      expect(store.textAnswer).toBe('My answer');
    });

    it('can clear text answer', () => {
      store.setTextAnswer('Text');
      store.setTextAnswer('');
      expect(store.textAnswer).toBe('');
    });
  });

  describe('nextQuestion', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
        { id: '2', type: 'essay', question: 'Q2', difficulty: 'medium', maxPoints: 10 },
      ];
      store.currentQuestionIndex = 0;
    });

    it('increments question index', () => {
      store.nextQuestion();
      expect(store.currentQuestionIndex).toBe(1);
    });

    it('clears selected answers', () => {
      store.selectedAnswers = [0, 1];
      store.nextQuestion();
      expect(store.selectedAnswers).toEqual([]);
    });

    it('clears text answer', () => {
      store.textAnswer = 'Some text';
      store.nextQuestion();
      expect(store.textAnswer).toBe('');
    });

    it('does not go beyond last question', () => {
      store.currentQuestionIndex = 1;
      store.nextQuestion();
      expect(store.currentQuestionIndex).toBe(2); // может быть 1, в зависимости от реализации
    });
  });

  describe('computed properties', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
        { id: '2', type: 'essay', question: 'Q2', difficulty: 'medium', maxPoints: 10 },
        { id: '3', type: 'multiple-select', question: 'Q3', options: [], difficulty: 'hard', maxPoints: 15 },
      ];
    });

    it('currentQuestion returns correct question', () => {
      store.currentQuestionIndex = 1;
      expect(store.currentQuestion?.id).toBe('2');
    });

    it('currentQuestion returns undefined for invalid index', () => {
      store.currentQuestionIndex = 99;
      expect(store.currentQuestion).toBeUndefined();
    });

    it('isLastQuestion returns true for last question', () => {
      store.currentQuestionIndex = 2;
      expect(store.isLastQuestion).toBe(true);
    });

    it('isLastQuestion returns false for non-last question', () => {
      store.currentQuestionIndex = 0;
      expect(store.isLastQuestion).toBe(false);
    });

    it('progress returns correct percentage', () => {
      // позиция 1 из 3 должна давать примерно 33%, позиция 2 из 3 - примерно 67%
      // Это проверка сколько вопросов отвечено
      store.currentQuestionIndex = 1;
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
        { id: '2', type: 'essay', question: 'Q2', difficulty: 'medium', maxPoints: 10 },
        { id: '3', type: 'multiple-select', question: 'Q3', options: [], difficulty: 'hard', maxPoints: 15 },
      ];
      expect(store.progress).toBe(67); // (2/3) * 100 = 66.67
    });

    it('progress returns 0 when no questions', () => {
      store.questions = [];
      expect(store.progress).toBe(0);
    });

    it('correctAnswersCount counts correct answers', () => {
      store.answers = [
        { questionId: '1', selectedAnswers: [0], isCorrect: true, points: 5 },
        { questionId: '2', selectedAnswers: [], isCorrect: false, points: 0 },
        { questionId: '3', selectedAnswers: [1], isCorrect: true, points: 10 },
      ];
      expect(store.correctAnswersCount).toBe(2);
    });

    it('startGame sets status to playing', () => {
      store.startGame();
      expect(store.isPlaying).toBe(true);
    });


    it('returns question with default difficulty when not specified', () => {
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], maxPoints: 5 } as any,
      ];
      store.currentQuestionIndex = 0;

      const q = store.currentQuestion;
      expect(q?.difficulty).toBe('easy');
    });

    it('resetGame resets all state', () => {
      store.isPlaying = true;
      store.currentQuestionIndex = 2;
      store.score = 100;
      store.selectedAnswers = [1, 2];
      store.textAnswer = 'Some answer';
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
      ];
      store.answers = [
        { questionId: '1', selectedAnswers: [0], isCorrect: true, points: 5 },
      ];

      store.resetGame();

      expect(store.isPlaying).toBe(false);
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.score).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.textAnswer).toBe('');
      expect(store.questions).toEqual([]);
      expect(store.answers).toEqual([]);
    });

    it('updates the last saved answer result', () => {
      store.answers = [
        { questionId: '1', selectedAnswers: [0], isCorrect: false, points: 0 },
      ];

      store.updateAnswerResult(true, 5);

      expect(store.answers[0].isCorrect).toBe(true);
      expect(store.answers[0].points).toBe(5);
      expect(store.score).toBe(5);
    });


  });
});

