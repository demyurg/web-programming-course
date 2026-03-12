import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gameStore } from '../stores/gameStore';

describe('GameStore submit', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    gameStore.resetGame();
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('token123');
  });

  it('sends selected options to /submit', async () => {
    gameStore.questions = [{
      id: 'q1',
      type: 'multiple-select',
      question: 'Q?',
      options: ['A', 'B', 'C'],
      difficulty: 'easy',
      
    }] as any;// времено 
    // иметация ссесии 
    gameStore.sessionId = 's1';
    gameStore.currentQuestionIndex = 0;
    gameStore.selectedAnswers = [0, 2];
    // имитируем успешный ответ 
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ pointsEarned: 1, isCorrect: true }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    await gameStore.submitCurrentAnswer();
    // жем ответа
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/sessions/s1/submit');
    expect(options.method).toBe('POST');
    // проверяет  правильный ли путь у url методот с post
    const body = JSON.parse(options.body);
    expect(body).toEqual({
      questionId: 'q1',
      selectedOptions: [0, 2],
    });
  });
});