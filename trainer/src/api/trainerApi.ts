import type { Answer, Result, ServerAttempt, TrainingSet } from "../domain";

const API_URL = "http://localhost:3001";

type TrainingSetInfo = {
  id: string;
  title: string;
  taskCount: number;
};

export async function getSets(): Promise<TrainingSetInfo[]> {
  const response = await fetch(`${API_URL}/api/sets`);

  if (!response.ok) {
    throw new Error("Не удалось загрузить список наборов");
  }

  const data: TrainingSetInfo[] = await response.json();

  return data;
}


export async function getSet(setId: string): Promise<TrainingSet> {
  const response = await fetch(`${API_URL}/api/sets/${setId}`);

  if (!response.ok) {
    throw new Error("Не удалось загрузить набор заданий");
  }

  const data: TrainingSet = await response.json();

  return data;
}


export async function createAttempt(setId: string): Promise<ServerAttempt> {
  const response = await fetch(`${API_URL}/api/attempts`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ setId: setId })
  });

  if (!response.ok) {
    throw new Error("Не удалось создать попытку");
  }

  const data: ServerAttempt = await response.json();

  return data;
}

export async function getAttempt(attemptId: string): Promise<ServerAttempt> {
  const response = await fetch(`${API_URL}/api/attempts/${attemptId}`);

  if (!response.ok) {
    throw new Error("Не удалось загрузить попытку");
  }

  const data: ServerAttempt = await response.json();

  return data;
}

export async function saveAnswer(attemptId: string, answer: Answer): Promise<ServerAttempt> {
  const response = await fetch(`${API_URL}/api/attempts/${attemptId}/answers/${answer.taskId}`,
    {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(answer)
    }
  );

  if (!response.ok) {
    throw new Error("Не удалось сохранить ответ");
  }

  const data: ServerAttempt = await response.json();

  return data;
}

export async function deleteAnswer(attemptId: string, taskId: string): Promise<ServerAttempt> {
  const response = await fetch(`${API_URL}/api/attempts/${attemptId}/answers/${taskId}`,
    {
      method: "DELETE"
    }
  );

  if (!response.ok) {
    throw new Error("Не удалось удалить ответ");
  }

  const data: ServerAttempt = await response.json();

  return data;
}

export async function submitAttempt(attemptId: string): Promise<Result> {
  const response = await fetch(`${API_URL}/api/attempts/${attemptId}/submit`,
    {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({})
    }
  );

  if (!response.ok) {
    throw new Error("Не удалось завершить попытку");
  }

  const data: Result = await response.json();

  return data;
}

export async function getResult(attemptId: string): Promise<Result> {
  const response = await fetch(`${API_URL}/api/attempts/${attemptId}/result`);

  if (!response.ok) {
    throw new Error("Не удалось загрузить результат попытки");
  }

  const data: Result = await response.json();

  return data;
}
