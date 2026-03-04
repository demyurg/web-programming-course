import { describe, it, expect, beforeEach } from 'vitest';
import { GameStore } from './gameStore';
import { Question } from '../types/quiz';

describe('GameStore', () => {
  let store: GameStore;

  const multipleQuestion: Question = {
    id: '1',
    type: 'multiple',
    question: 'Test multiple',
    options: ['A', 'B'],
    correctAnswers: [0],
    difficulty: 'easy',
  };

  const essayQuestion: Question = {
    id: '2',
    type: 'essay',
    question: 'Test essay',
    difficulty: 'medium',
  };

  beforeEach(() => {
    store = new GameStore();
  });

  // 1
  it('initializes with default state', () => {
    expect(store.gameStatus).toBe('idle');
    expect(store.isPlaying).toBe(false);
    expect(store.questions).toEqual([]);
    expect(store.selectedAnswers).toEqual([]);
    expect(store.textAnswer).toBe('');
    expect(store.progress).toBe(0);
  });

  // 2
  it('starts game correctly', () => {
    store.startGame();
    expect(store.gameStatus).toBe('playing');
    expect(store.currentQuestionIndex).toBe(0);
    expect(store.selectedAnswers).toEqual([]);
  });

  // 3
  it('toggles answers correctly', () => {
    store.toggleAnswer(0);
    expect(store.selectedAnswers).toEqual([0]);

    store.toggleAnswer(0);
    expect(store.selectedAnswers).toEqual([]);
  });

  // 4
  it('sets text answer', () => {
    store.setTextAnswer('Hello');
    expect(store.textAnswer).toBe('Hello');
  });

  // 5
  it('saves correct multiple choice answer', () => {
    store.questions = [multipleQuestion];
    store.selectedAnswers = [0];

    store.saveCurrentAnswer();

    expect(store.answers.length).toBe(1);
    expect(store.answers[0].isCorrect).toBe(true);
  });

  // 6
  it('saves incorrect multiple choice answer', () => {
    store.questions = [multipleQuestion];
    store.selectedAnswers = [1];

    store.saveCurrentAnswer();

    expect(store.answers[0].isCorrect).toBe(false);
  });

  // 7
  it('saves essay answer', () => {
    store.questions = [essayQuestion];
    store.textAnswer = 'My essay';

    store.saveCurrentAnswer();

    expect(store.answers[0].textAnswer).toBe('My essay');
    expect(store.answers[0].isCorrect).toBe(true);
  });

  // 8
  it('moves to next question and resets answers', () => {
    store.questions = [multipleQuestion, essayQuestion];
    store.selectedAnswers = [0];
    store.textAnswer = 'text';
    store.currentQuestionIndex = 0;

    store.nextQuestion();

    expect(store.currentQuestionIndex).toBe(1);
    expect(store.selectedAnswers).toEqual([]);
    expect(store.textAnswer).toBe('');
  });

  // 9
  it('finishes game on last question', () => {
    store.questions = [multipleQuestion];
    store.currentQuestionIndex = 0;

    store.nextQuestion();

    expect(store.gameStatus).toBe('finished');
  });

  // 10
  it('calculates progress correctly', () => {
    store.questions = [multipleQuestion, essayQuestion];
    store.currentQuestionIndex = 0;

    expect(store.progress).toBe(50);
  });
});