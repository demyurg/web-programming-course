import { TrainingSet, Answer, ServerAttempt, AttemptResult } from "../domain";

const API_BASE = "http://localhost:3001/api";

async function request<T>(path: string, options?: RequestInit, simulateFail = false): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (options?.body) {
    headers["Content-Type"] = "application/json";
  }

  if (simulateFail) {
    headers["X-Demo-Fail"] = "1";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetails = `Ошибка сервера (HTTP ${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody && typeof errBody.error === "string") {
        errorDetails = `${errorDetails}: ${errBody.error}`;
      }
    } catch {
      
    }
    throw new Error(errorDetails);
  }

  return response.json() as Promise<T>;
}

export const trainerApi = {
  getSets(): Promise<{ id: string; title: string }[]> {
    return request("/sets");
  },

  getSetById(setId: string): Promise<TrainingSet> {
    return request(`/sets/${setId}`);
  },

  createAttempt(setId: string): Promise<ServerAttempt> {
    return request("/attempts", {
      method: "POST",
      body: JSON.stringify({ setId }),
    });
  },

  getAttempt(attemptId: string): Promise<ServerAttempt> {
    return request(`/attempts/${attemptId}`);
  },

  saveAnswer(attemptId: string, answer: Answer, simulateFail = false): Promise<ServerAttempt> {
    return request(
      `/attempts/${attemptId}/answers/${answer.taskId}`,
      {
        method: "PUT",
        body: JSON.stringify(answer),
      },
      simulateFail
    );
  },

  deleteAnswer(attemptId: string, taskId: string, simulateFail = false): Promise<ServerAttempt> {
    return request(
      `/attempts/${attemptId}/answers/${taskId}`,
      {
        method: "DELETE",
      },
      simulateFail
    );
  },

  submitAttempt(attemptId: string, simulateFail = false): Promise<ServerAttempt> {
    return request(
      `/attempts/${attemptId}/submit`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
      simulateFail
    );
  },

  getResult(attemptId: string): Promise<AttemptResult> {
    return request(`/attempts/${attemptId}/result`);
  },
};
