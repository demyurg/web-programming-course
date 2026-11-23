import type { Answer, Task, TrainingSet } from "./domain";

const BASE = "http://localhost:3001/api";

export type ServerAttempt = {
    id: string;
    setId: string;
    status: "in-progress" | "submitted";
    answers: Answer[];
};

export type ResultItem = {
    taskId: string;
    status: "correct" | "incorrect" | "unanswered" | "pending-review";
    score: number | null;
    maxScore: number;
    feedback: string;
};

export type ServerResult = {
    attemptId: string;
    status: "graded" | "pending-review";
    score: number | null;
    maxScore: number;
    items: ResultItem[];
};

export class ApiError extends Error {
    constructor(message: string, public readonly status?: number) {
        super(message);
    }
}

function record(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validAnswer(value: unknown): value is Answer {
    return record(value) && typeof value.taskId === "string" && (
        (value.kind === "single-choice" && typeof value.optionId === "string") ||
        (value.kind === "short-text" && typeof value.text === "string")
    );
}

function validTask(value: unknown): value is Task {
    return record(value) && typeof value.id === "string" && typeof value.topic === "string" &&
        typeof value.prompt === "string" && (value.code === undefined || typeof value.code === "string") && (
            (value.kind === "short-text") ||
            (value.kind === "single-choice" && Array.isArray(value.options) &&
                value.options.every((option) => record(option) && typeof option.id === "string" && typeof option.label === "string"))
        );
}

function asSet(value: unknown): TrainingSet {
    if (!record(value) || typeof value.id !== "string" || typeof value.title !== "string" ||
        !Array.isArray(value.tasks) || !value.tasks.every(validTask)) {
        throw new ApiError("Сервер вернул неверный формат модуля.");
    }
    return value as TrainingSet;
}

function asAttempt(value: unknown): ServerAttempt {
    if (!record(value) || typeof value.id !== "string" || typeof value.setId !== "string" ||
        (value.status !== "in-progress" && value.status !== "submitted") ||
        !Array.isArray(value.answers) || !value.answers.every(validAnswer)) {
        throw new ApiError("Сервер вернул неверный формат попытки.");
    }
    return value as ServerAttempt;
}

function asResult(value: unknown): ServerResult {
    if (!record(value) || typeof value.attemptId !== "string" ||
        (value.status !== "graded" && value.status !== "pending-review") ||
        !(typeof value.score === "number" || value.score === null) || typeof value.maxScore !== "number" ||
        !Array.isArray(value.items) || !value.items.every((item) => record(item) &&
            typeof item.taskId === "string" &&
            ["correct", "incorrect", "unanswered", "pending-review"].includes(String(item.status)) &&
            (typeof item.score === "number" || item.score === null) &&
            typeof item.maxScore === "number" && typeof item.feedback === "string")) {
        throw new ApiError("Сервер вернул неверный формат результата.");
    }
    return value as ServerResult;
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
    let response: Response;
    try {
        response = await fetch(`${BASE}${path}`, init);
    } catch {
        throw new ApiError("Нет соединения с учебным сервером. Проверьте, что он запущен.");
    }
    let body: unknown;
    try {
        body = await response.json() as unknown;
    } catch {
        throw new ApiError("Сервер вернул ответ, который не является JSON.", response.status);
    }
    if (!response.ok) {
        const message = record(body) && record(body.error) && typeof body.error.message === "string"
            ? body.error.message : `Ошибка HTTP ${response.status}`;
        throw new ApiError(message, response.status);
    }
    return body;
}

const json = (value: unknown): RequestInit => ({
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
});

export const getSet = async (id: string) => asSet(await request(`/sets/${encodeURIComponent(id)}`));
export const createAttempt = async (setId: string) => asAttempt(await request("/attempts", { method: "POST", ...json({ setId }) }));
export const getAttempt = async (id: string) => asAttempt(await request(`/attempts/${encodeURIComponent(id)}`));
export const putAnswer = async (id: string, answer: Answer, demoFail = false) => asAttempt(await request(
    `/attempts/${encodeURIComponent(id)}/answers/${encodeURIComponent(answer.taskId)}`,
    { method: "PUT", ...json(answer), headers: { "Content-Type": "application/json", ...(demoFail ? { "X-Demo-Fail": "1" } : {}) } }
));
export const deleteAnswer = async (id: string, taskId: string) => asAttempt(await request(
    `/attempts/${encodeURIComponent(id)}/answers/${encodeURIComponent(taskId)}`,
    { method: "DELETE" }
));
export const submitAttempt = async (id: string) => asResult(await request(
    `/attempts/${encodeURIComponent(id)}/submit`, { method: "POST", ...json({}) }
));
export const getResult = async (id: string) => asResult(await request(`/attempts/${encodeURIComponent(id)}/result`));
