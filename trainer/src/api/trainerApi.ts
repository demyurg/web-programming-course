import type { Answer, AttemptResult, TrainingSet } from "../domain";

const API_URL = "http://localhost:3001";

export type ServerAttempt = {
  id: string;
  setId: string;
  status: "in-progress" | "submitted";
  answers: Answer[];
};

export type SetInfo = {
  id: string;
  title: string;
  taskCount: number;
};

async function send(
  path: string,
  method: string,
  body?: unknown,
  demoFail = false
) {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (demoFail) {
    headers["X-Demo-Fail"] = "1";
  }

  let response: Response;

  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Нет соединения с сервером");
  }

  if (!response.ok) {
    throw new Error("Ошибка HTTP " + response.status);
  }

  return response.json();
}

export function getSets(demoFail = false): Promise<SetInfo[]> {
  return send("/api/sets", "GET", undefined, demoFail);
}

export function getTrainingSet(
  setId: string,
  demoFail = false
): Promise<TrainingSet> {
  return send("/api/sets/" + setId, "GET", undefined, demoFail);
}

export function createAttempt(
  setId: string,
  demoFail = false
): Promise<ServerAttempt> {
  return send("/api/attempts", "POST", { setId }, demoFail);
}

export function getAttempt(
  attemptId: string,
  demoFail = false
): Promise<ServerAttempt> {
  return send("/api/attempts/" + attemptId, "GET", undefined, demoFail);
}

export function putAnswer(
  attemptId: string,
  answer: Answer,
  demoFail = false
): Promise<ServerAttempt> {
  return send(
    "/api/attempts/" + attemptId + "/answers/" + answer.taskId,
    "PUT",
    answer,
    demoFail
  );
}

export function deleteAnswer(
  attemptId: string,
  taskId: string,
  demoFail = false
): Promise<ServerAttempt> {
  return send(
    "/api/attempts/" + attemptId + "/answers/" + taskId,
    "DELETE",
    undefined,
    demoFail
  );
}

export function submitAttempt(
  attemptId: string,
  demoFail = false
): Promise<AttemptResult> {
  return send("/api/attempts/" + attemptId + "/submit", "POST", {}, demoFail);
}

export function getResult(
  attemptId: string,
  demoFail = false
): Promise<AttemptResult> {
  return send(
    "/api/attempts/" + attemptId + "/result",
    "GET",
    undefined,
    demoFail
  );
}
