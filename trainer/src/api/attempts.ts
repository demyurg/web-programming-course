import type { Answer } from "../domain";
import { request } from "./http";

export type ResultItem = {
  taskId: string;
  status: "correct" | "incorrect" | "unanswered" | "pending-review";
  score: number | null;
  maxScore: number;
  feedback: string | null;
};

export type AttemptResultData = {
  attemptId: string;
  status: "graded" | "pending-review";
  score: number | null;
  maxScore: number;
  items: ResultItem[];
};

export type ServerAttempt = {
  id: string;
  setId: string;
  status: "in-progress" | "submitted";
  answers: Answer[];
  result?: AttemptResultData | null;
};

export function createAttempt(setId: string): Promise<ServerAttempt> {
  return request<ServerAttempt>("/api/attempts", {
    method: "POST",
    body: JSON.stringify({ setId }),
  });
}

export function loadAttempt(attemptId: string): Promise<ServerAttempt> {
  return request<ServerAttempt>(`/api/attempts/${attemptId}`);
}

export function saveAnswer(
  attemptId: string,
  answer: Answer,
  fail = false
): Promise<ServerAttempt> {
  return request<ServerAttempt>(
    `/api/attempts/${attemptId}/answers/${answer.taskId}`,
    {
      method: "PUT",
      body: JSON.stringify(answer),
      headers: fail ? { "X-Demo-Fail": "1" } : undefined,
    }
  );
}

export function deleteAnswer(
  attemptId: string,
  taskId: string
): Promise<ServerAttempt> {
  return request<ServerAttempt>(
    `/api/attempts/${attemptId}/answers/${taskId}`,
    {
      method: "DELETE",
    }
  );
}

export function submitAttempt(attemptId: string): Promise<AttemptResultData> {
  return request<AttemptResultData>(`/api/attempts/${attemptId}/submit`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function loadResult(attemptId: string): Promise<AttemptResultData> {
  return request<AttemptResultData>(`/api/attempts/${attemptId}/result`);
}