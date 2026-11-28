import { type TrainingSet } from '../domain.js';

const API_BASE = 'http://localhost:3001/api';

export type AnswerPayload =
  | { taskId: string; kind: 'single-choice'; optionId: string }
  | { taskId: string; kind: 'short-text'; text: string };

export type Attempt = {
  attemptId: string;
  setId: string;
  status: 'draft' | 'submitted' | 'pending-review';
  answers: AnswerPayload[];
  trainingSet?: TrainingSet; 
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Network error');
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  if (response.status === 204) return null as unknown as T;

  return response.json();
}

export const trainerApi = {

  getSets: () => request<{ id: string; title: string }[]>(`${API_BASE}/sets`),
  getSet: (setId: string) => request<TrainingSet>(`${API_BASE}/sets/${setId}`),

  createAttempt: (setId: string) =>
    request<Attempt>(`${API_BASE}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ setId }),
    }),

  getAttempt: (attemptId: string) =>
    request<Attempt>(`${API_BASE}/attempts/${attemptId}`),

  saveAnswer: (attemptId: string, taskId: string, answer: AnswerPayload) =>
    request(`${API_BASE}/attempts/${attemptId}/answers/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(answer),
    }),

  deleteAnswer: (attemptId: string, taskId: string) =>
    request(`${API_BASE}/attempts/${attemptId}/answers/${taskId}`, {
      method: 'DELETE',
    }),


  submitAttempt: (attemptId: string) =>
    request<{ status: string }>(`${API_BASE}/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};