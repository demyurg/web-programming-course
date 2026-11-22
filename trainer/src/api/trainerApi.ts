//сеть и разбор ответов
const BASE_URL = "http://localhost:3001";

export type ApiOption = {
  id: string;
  label: string;
};

export type ApiSingleChoiceTask = {
  id: string;
  kind: "single-choice";
  topic: string;
  prompt: string;
  code?: string;
  options: ApiOption[];
};

export type ApiShortTextTask = {
  id: string;
  kind: "short-text";
  topic: string;
  prompt: string;
  code?: string;
};

export type ApiTask = ApiSingleChoiceTask | ApiShortTextTask;

export type ApiSetSummary = {
  id: string;
  title: string;
  taskCount: number;
};

export type ApiSet = {
  id: string;
  title: string;
  tasks: ApiTask[];
};

export type ApiSingleChoiceAnswer = {
  taskId: string;
  kind: "single-choice";
  optionId: string;
};

export type ApiShortTextAnswer = {
  taskId: string;
  kind: "short-text";
  text: string;
};

export type ApiAnswer = ApiSingleChoiceAnswer | ApiShortTextAnswer;

export type ApiAttempt = {
  id: string;
  setId: string;
  status: "in-progress" | "submitted";
  answers: ApiAnswer[];
};

export type ApiResultItem = {
  taskId: string;
  status: "correct" | "incorrect" | "unanswered" | "pending-review";
  score: number | null;
  maxScore: number;
  feedback: string;
};

export type ApiResult = {
  attemptId: string;
  status: "graded" | "pending-review";
  score: number | null;                       //null = ожидает проверки, не ноль
  maxScore: number;
  items: ApiResultItem[];
};

//внутренняя обвязка

class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export { ApiError };

async function request<T>(
  path: string,
  init?: RequestInit & { demoFail?: boolean }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (init?.demoFail) {
    headers["X-Demo-Fail"] = "1";
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    //при отсутствии соединения / сервер не запущен
    throw new ApiError(0, "NETWORK_ERROR", "Нет соединения с учебным сервером.");
  }

  if (!response.ok) {
    let code = "HTTP_ERROR";
    let message = `Ошибка сервера (${response.status}).`;
    try {
      const body = (await response.json()) as {
        error?: { code?: string; message?: string };
      };
      if (body?.error?.code) code = body.error.code;
      if (body?.error?.message) message = body.error.message;
    } catch {
      //тело не JSON — оставляем сообщение по умолчанию
    }
    throw new ApiError(response.status, code, message);
  }

  //204 без тела
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

//публичные функции API
export function fetchSets(): Promise<ApiSetSummary[]> {
  return request<ApiSetSummary[]>("/api/sets");
}

export function fetchSet(setId: string): Promise<ApiSet> {
  return request<ApiSet>(`/api/sets/${encodeURIComponent(setId)}`);
}

export function createAttempt(setId: string): Promise<ApiAttempt> {
  return request<ApiAttempt>("/api/attempts", {
    method: "POST",
    body: JSON.stringify({ setId }),
  });
}

export function getAttempt(attemptId: string): Promise<ApiAttempt> {
  return request<ApiAttempt>(`/api/attempts/${encodeURIComponent(attemptId)}`);
}

export function putAnswer(
  attemptId: string,
  answer: ApiAnswer,
  options?: { demoFail?: boolean }
): Promise<ApiAttempt> {
  return request<ApiAttempt>(
    `/api/attempts/${encodeURIComponent(attemptId)}/answers/${encodeURIComponent(
      answer.taskId
    )}`,
    {
      method: "PUT",
      body: JSON.stringify(answer),
      demoFail: options?.demoFail,
    }
  );
}

export function deleteAnswer(
  attemptId: string,
  taskId: string,
  options?: { demoFail?: boolean }
): Promise<ApiAttempt> {
  return request<ApiAttempt>(
    `/api/attempts/${encodeURIComponent(attemptId)}/answers/${encodeURIComponent(
      taskId
    )}`,
    {
      method: "DELETE",
      demoFail: options?.demoFail,
    }
  );
}

export function submitAttempt(attemptId: string): Promise<ApiResult> {
  return request<ApiResult>(
    `/api/attempts/${encodeURIComponent(attemptId)}/submit`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
}

export function getResult(attemptId: string): Promise<ApiResult> {
  return request<ApiResult>(
    `/api/attempts/${encodeURIComponent(attemptId)}/result`
  );
}