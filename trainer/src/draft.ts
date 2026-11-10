import type { Answer } from "./domain";
import type { AttemptState, Draft } from "./attempt";
import { trainingSet } from "./trainingSet";

export const DRAFT_KEY = `trainer:draft:${trainingSet.id}`;

export type DraftReadResult =
    | { kind: "absent" }
    | { kind: "valid"; draft: Draft }
    | { kind: "invalid"; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAnswer(value: unknown): Answer | null {
    if (!isRecord(value) || typeof value.taskId !== "string") return null;

    const task = trainingSet.tasks.find((item) => item.id === value.taskId);
    if (!task || value.kind !== task.kind) return null;

    if (task.kind === "single-choice") {
        if (
            typeof value.optionId !== "string" ||
            !task.options.some((option) => option.id === value.optionId)
        ) return null;

        return {
            taskId: task.id,
            kind: "single-choice",
            optionId: value.optionId,
        };
    }

    if (typeof value.text !== "string") return null;
    return { taskId: task.id, kind: "short-text", text: value.text };
}

export function parseDraft(raw: string | null): DraftReadResult {
    if (raw === null) return { kind: "absent" };

    let value: unknown;
    try {
        value = JSON.parse(raw) as unknown;
    } catch {
        return { kind: "invalid", message: "Черновик повреждён: неверный JSON." };
    }

    if (!isRecord(value)) {
        return { kind: "invalid", message: "Черновик повреждён: неверный формат." };
    }
    if (value.setId !== trainingSet.id) {
        return { kind: "invalid", message: "Черновик относится к другому набору заданий." };
    }
    if (
        value.version !== 1 ||
        (value.status !== "in-progress" && value.status !== "submitted") ||
        typeof value.taskId !== "string" ||
        !trainingSet.tasks.some((task) => task.id === value.taskId) ||
        !Array.isArray(value.answers)
    ) {
        return { kind: "invalid", message: "Черновик повреждён или несовместим с этой версией." };
    }

    const answers: Answer[] = [];
    const seenTaskIds = new Set<string>();
    for (const item of value.answers) {
        const answer = parseAnswer(item);
        if (!answer || seenTaskIds.has(answer.taskId)) {
            return { kind: "invalid", message: "Черновик содержит недопустимые ответы." };
        }
        seenTaskIds.add(answer.taskId);
        answers.push(answer);
    }

    return {
        kind: "valid",
        draft: {
            version: 1,
            setId: trainingSet.id,
            taskId: value.taskId,
            answers,
            status: value.status,
        },
    };
}

export function createDraft(
    state: Pick<AttemptState, "answers" | "currentIndex" | "status">
): Draft {
    return {
        version: 1,
        setId: trainingSet.id,
        taskId: trainingSet.tasks[state.currentIndex]?.id ?? trainingSet.tasks[0]?.id ?? "",
        answers: state.answers,
        status: state.status,
    };
}
