import { useEffect, useReducer, useState } from "react";
import {
    calculateProgress,
    isAnswered,
    type Answer,
    type Task,
    type TrainingSet,
} from "./domain";

const apiBaseUrl = "http://localhost:3001";

type AttemptState = {
    answers: Answer[];
    confirmedAnswers: Answer[];
    pendingChanges: Record<string, Answer | null>;
    attemptId: string | null;
    result: AttemptResult | null;
    currentIndex: number;
    status: "in-progress" | "submitted";
};

type Draft = {
    version: 1;
    setId: string;
    taskId: string;
    answers: Answer[];
    status: "in-progress" | "submitted";
    attemptId?: string;
    pendingChanges?: Record<string, Answer | null>;
};

type ApiAttempt = {
    id: string;
    setId: string;
    status: "in-progress" | "submitted";
    answers: Answer[];
};

type AttemptResult = {
    attemptId: string;
    status: "graded" | "pending-review";
    score: number | null;
    maxScore: number;
    items: {
        taskId: string;
        status: "correct" | "incorrect" | "unanswered" | "pending-review";
        score: number | null;
        maxScore: number;
        feedback: string;
    }[];
};

type AttemptEvent =
    | { type: "answerChanged"; answer: Answer }
    | { type: "answerCleared"; taskId: string }
    | { type: "moved"; index: number; maxIndex: number }
    | {
          type: "sessionReady";
          attempt: ApiAttempt;
          pendingChanges: Record<string, Answer | null>;
          currentIndex: number;
          result: AttemptResult | null;
      }
    | { type: "serverSynced"; attempt: ApiAttempt; taskId: string }
    | { type: "submitted"; result: AttemptResult }
    | { type: "reset" };

const draftStorageKey = "trainer.attempt-draft";
const emptyTrainingSet: TrainingSet = { id: "", title: "", tasks: [] };

const initialAttempt: AttemptState = {
    answers: [],
    confirmedAnswers: [],
    pendingChanges: {},
    attemptId: null,
    result: null,
    currentIndex: 0,
    status: "in-progress",
};

function mergeAnswers(
    confirmedAnswers: Answer[],
    pendingChanges: Record<string, Answer | null>,
): Answer[] {
    const answers = new Map(confirmedAnswers.map((answer) => [answer.taskId, answer]));
    for (const [taskId, answer] of Object.entries(pendingChanges)) {
        if (answer === null) {
            answers.delete(taskId);
        } else {
            answers.set(taskId, answer);
        }
    }
    return [...answers.values()];
}

function answerEquals(left: Answer | undefined, right: Answer | undefined): boolean {
    if (!left || !right || left.kind !== right.kind || left.taskId !== right.taskId) {
        return left === right;
    }
    return left.kind === "single-choice"
        ? right.kind === "single-choice" && left.optionId === right.optionId
        : right.kind === "short-text" && left.text === right.text;
}

function reconcilePendingChanges(
    confirmedAnswers: Answer[],
    pendingChanges: Record<string, Answer | null>,
): Record<string, Answer | null> {
    return Object.fromEntries(
        Object.entries(pendingChanges).filter(([taskId, change]) => {
            const confirmed = confirmedAnswers.find((answer) => answer.taskId === taskId);
            return change === null ? confirmed !== undefined : !answerEquals(change, confirmed);
        }),
    );
}

function attemptReducer(state: AttemptState, event: AttemptEvent): AttemptState {
    if (event.type === "reset") {
        return initialAttempt;
    }

    if (event.type === "sessionReady") {
        return {
            ...initialAttempt,
            answers: mergeAnswers(event.attempt.answers, event.pendingChanges),
            confirmedAnswers: event.attempt.answers,
            pendingChanges: event.pendingChanges,
            attemptId: event.attempt.id,
            currentIndex: event.currentIndex,
            status: event.attempt.status,
            result: event.result,
        };
    }

    if (state.status === "submitted") {
        return state;
    }

    switch (event.type) {
        case "answerChanged": {
            const confirmed = state.confirmedAnswers.find(
                (answer) => answer.taskId === event.answer.taskId,
            );
            const pendingChanges = { ...state.pendingChanges };
            if (answerEquals(confirmed, event.answer)) {
                delete pendingChanges[event.answer.taskId];
            } else {
                pendingChanges[event.answer.taskId] = event.answer;
            }
            return {
                ...state,
                answers: [
                    ...state.answers.filter((answer) => answer.taskId !== event.answer.taskId),
                    event.answer,
                ],
                pendingChanges,
            };
        }
        case "answerCleared": {
            const pendingChanges = { ...state.pendingChanges };
            if (state.confirmedAnswers.some((answer) => answer.taskId === event.taskId)) {
                pendingChanges[event.taskId] = null;
            } else {
                delete pendingChanges[event.taskId];
            }
            return {
                ...state,
                answers: state.answers.filter((answer) => answer.taskId !== event.taskId),
                pendingChanges,
            };
        }
        case "serverSynced": {
            const pendingChanges = { ...state.pendingChanges };
            delete pendingChanges[event.taskId];
            return {
                ...state,
                answers: mergeAnswers(event.attempt.answers, pendingChanges),
                confirmedAnswers: event.attempt.answers,
                pendingChanges,
            };
        }
        case "moved":
            return {
                ...state,
                currentIndex: Math.max(0, Math.min(event.index, event.maxIndex)),
            };
        case "submitted":
            return { ...state, status: "submitted", result: event.result };
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTrainingSet(value: unknown): TrainingSet {
    if (
        !isRecord(value) ||
        typeof value.id !== "string" ||
        typeof value.title !== "string" ||
        !Array.isArray(value.tasks)
    ) {
        throw new Error("Сервер вернул набор заданий в неверном формате.");
    }

    const tasks: Task[] = value.tasks.map((item) => {
        if (
            !isRecord(item) ||
            typeof item.id !== "string" ||
            typeof item.kind !== "string" ||
            typeof item.topic !== "string" ||
            typeof item.prompt !== "string" ||
            (item.code !== undefined && typeof item.code !== "string")
        ) {
            throw new Error("Сервер вернул задание в неверном формате.");
        }

        if (item.kind === "single-choice" && Array.isArray(item.options)) {
            const options = item.options.map((option) => {
                if (
                    !isRecord(option) ||
                    typeof option.id !== "string" ||
                    typeof option.label !== "string"
                ) {
                    throw new Error("Сервер вернул вариант ответа в неверном формате.");
                }
                return { id: option.id, label: option.label };
            });
            return {
                id: item.id,
                kind: "single-choice",
                topic: item.topic,
                prompt: item.prompt,
                ...(item.code === undefined ? {} : { code: item.code }),
                options,
            };
        }

        if (item.kind === "short-text" && item.options === undefined) {
            return {
                id: item.id,
                kind: "short-text",
                topic: item.topic,
                prompt: item.prompt,
                ...(item.code === undefined ? {} : { code: item.code }),
            };
        }

        throw new Error("Сервер вернул задание с неизвестным типом.");
    });

    return { id: value.id, title: value.title, tasks };
}

function parseAnswer(value: unknown, trainingSet: TrainingSet): Answer | undefined {
    if (!isRecord(value) || typeof value.taskId !== "string") {
        return undefined;
    }

    const task = trainingSet.tasks.find((candidate) => candidate.id === value.taskId);
    if (
        task?.kind === "single-choice" &&
        value.kind === "single-choice" &&
        typeof value.optionId === "string" &&
        task.options.some((option) => option.id === value.optionId)
    ) {
        return { taskId: task.id, kind: "single-choice", optionId: value.optionId };
    }
    if (task?.kind === "short-text" && value.kind === "short-text" && typeof value.text === "string") {
        return { taskId: task.id, kind: "short-text", text: value.text };
    }
    return undefined;
}

function parseApiAttempt(value: unknown, trainingSet: TrainingSet): ApiAttempt {
    if (
        !isRecord(value) ||
        typeof value.id !== "string" ||
        value.setId !== trainingSet.id ||
        (value.status !== "in-progress" && value.status !== "submitted") ||
        !Array.isArray(value.answers)
    ) {
        throw new Error("Сервер вернул попытку в неверном формате.");
    }

    const answers: Answer[] = [];
    for (const item of value.answers) {
        const answer = parseAnswer(item, trainingSet);
        if (!answer || answers.some((existing) => existing.taskId === answer.taskId)) {
            throw new Error("Сервер вернул некорректный или повторный ответ.");
        }
        answers.push(answer);
    }
    return { id: value.id, setId: value.setId, status: value.status, answers };
}

function parseAttemptResult(value: unknown, trainingSet: TrainingSet): AttemptResult {
    if (
        !isRecord(value) ||
        typeof value.attemptId !== "string" ||
        (value.status !== "graded" && value.status !== "pending-review") ||
        (value.score !== null && typeof value.score !== "number") ||
        typeof value.maxScore !== "number" ||
        !Array.isArray(value.items)
    ) {
        throw new Error("Сервер вернул результат в неверном формате.");
    }

    const items: AttemptResult["items"] = [];
    for (const item of value.items) {
        if (
            !isRecord(item) ||
            typeof item.taskId !== "string" ||
            !trainingSet.tasks.some((task) => task.id === item.taskId) ||
            (item.status !== "correct" &&
                item.status !== "incorrect" &&
                item.status !== "unanswered" &&
                item.status !== "pending-review") ||
            (item.score !== null && typeof item.score !== "number") ||
            typeof item.maxScore !== "number" ||
            typeof item.feedback !== "string"
        ) {
            throw new Error("Сервер вернул элемент результата в неверном формате.");
        }
        items.push({
            taskId: item.taskId,
            status: item.status,
            score: item.score,
            maxScore: item.maxScore,
            feedback: item.feedback,
        });
    }
    return {
        attemptId: value.attemptId,
        status: value.status,
        score: value.score,
        maxScore: value.maxScore,
        items,
    };
}

async function apiRequest(path: string, init?: RequestInit): Promise<unknown> {
    let response: Response;
    try {
        response = await fetch(`${apiBaseUrl}${path}`, {
            ...init,
            headers: {
                ...(init?.body ? { "Content-Type": "application/json" } : {}),
                ...init?.headers,
            },
        });
    } catch (error) {
        const detail = error instanceof Error ? ` ${error.message}` : "";
        throw new Error(`Не удалось связаться с сервером.${detail}`);
    }

    let body: unknown;
    try {
        body = await response.json();
    } catch {
        throw new Error(`Сервер вернул некорректный JSON (HTTP ${response.status}).`);
    }
    if (!response.ok) {
        const message =
            isRecord(body) &&
            isRecord(body.error) &&
            typeof body.error.message === "string"
                ? body.error.message
                : "Запрос отклонён сервером.";
        throw new Error(`HTTP ${response.status}: ${message}`);
    }
    return body;
}

function validateDraft(value: unknown, trainingSet: TrainingSet):
    | { valid: true; draft: Draft }
    | { valid: false; message: string } {
    if (!isRecord(value)) {
        return { valid: false, message: "Черновик повреждён: ожидался объект с данными попытки." };
    }
    if (value.version !== 1) {
        return { valid: false, message: "Черновик использует неизвестную версию формата." };
    }
    if (value.setId !== trainingSet.id) {
        return { valid: false, message: "Черновик относится к другому набору заданий." };
    }
    if (value.status !== "in-progress" && value.status !== "submitted") {
        return { valid: false, message: "В черновике указан недопустимый статус попытки." };
    }
    if (
        typeof value.taskId !== "string" ||
        (trainingSet.tasks.length > 0 &&
            !trainingSet.tasks.some((task) => task.id === value.taskId)) ||
        (trainingSet.tasks.length === 0 && value.taskId !== "")
    ) {
        return { valid: false, message: "Текущее задание из черновика отсутствует в этом наборе." };
    }
    if (!Array.isArray(value.answers)) {
        return { valid: false, message: "Черновик повреждён: список ответов имеет неверный формат." };
    }

    const answers: Answer[] = [];
    const seenTaskIds = new Set<string>();

    for (const item of value.answers) {
        if (!isRecord(item) || typeof item.taskId !== "string" || seenTaskIds.has(item.taskId)) {
            return { valid: false, message: "Черновик содержит некорректный или повторный ответ." };
        }

        const answer = parseAnswer(item, trainingSet);
        if (!answer) {
            return { valid: false, message: "Черновик содержит ответ неподходящего формата." };
        }

        answers.push(answer);
        seenTaskIds.add(item.taskId);
    }

    const pendingChanges: Record<string, Answer | null> = {};
    if (value.pendingChanges !== undefined) {
        if (!isRecord(value.pendingChanges)) {
            return { valid: false, message: "Черновик содержит некорректные неподтверждённые ответы." };
        }
        for (const [taskId, item] of Object.entries(value.pendingChanges)) {
            if (!trainingSet.tasks.some((task) => task.id === taskId)) {
                return { valid: false, message: "Черновик содержит ответ на задание из другого набора." };
            }
            if (item === null) {
                pendingChanges[taskId] = null;
                continue;
            }
            const answer = parseAnswer(item, trainingSet);
            if (!answer || answer.taskId !== taskId) {
                return { valid: false, message: "Черновик содержит ответ неподходящего формата." };
            }
            pendingChanges[taskId] = answer;
        }
    }
    if (value.attemptId !== undefined && typeof value.attemptId !== "string") {
        return { valid: false, message: "Черновик содержит некорректный идентификатор попытки." };
    }

    return {
        valid: true,
        draft: {
            version: 1,
            setId: trainingSet.id,
            taskId: value.taskId,
            answers,
            status: value.status,
            ...(typeof value.attemptId === "string" ? { attemptId: value.attemptId } : {}),
            ...(value.pendingChanges === undefined ? {} : { pendingChanges }),
        },
    };
}

type TaskListProps = {
    tasks: Task[];
    currentIndex: number;
    answers: Answer[];
    isBusy: boolean;
    onChoose: (index: number) => void;
};

function TaskList({ tasks, currentIndex, answers, isBusy, onChoose }: TaskListProps) {
    if (tasks.length === 0) {
        return <p className="empty-list">В этом наборе пока нет заданий.</p>;
    }

    return (
        <nav className="task-list" aria-label="Задания набора">
            {tasks.map((task, index) => {
                const answer = answers.find((item) => item.taskId === task.id);
                const completed = isAnswered(answer);

                return (
                    <button
                        className={`task-button${index === currentIndex ? " is-selected" : ""}`}
                        key={task.id}
                        type="button"
                        disabled={isBusy}
                        aria-current={index === currentIndex ? "step" : undefined}
                        onClick={() => onChoose(index)}
                    >
                        <span className="task-number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="task-button-copy">
                            <span className="task-button-topic">{task.topic}</span>
                            <span className="task-button-title">{task.prompt}</span>
                            <span className={`task-status${completed ? " is-complete" : ""}`}>
                                {completed ? "Ответ дан" : "Не заполнено"}
                            </span>
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}

type TaskFormProps = {
    task: Task;
    answer: Answer | undefined;
    isPending: boolean;
    isConfirmed: boolean;
    isBusy: boolean;
    onAnswerChange: (answer: Answer) => void;
    onSaveAnswer: () => void;
    onClearAnswer: () => void;
};

function TaskForm({
    task,
    answer,
    isPending,
    isConfirmed,
    isBusy,
    onAnswerChange,
    onSaveAnswer,
    onClearAnswer,
}: TaskFormProps) {
    return (
        <article className="task-card">
            <div className="task-card-meta">
                <span className="eyebrow">{task.topic}</span>
                <span className="kind-label">
                    {task.kind === "single-choice" ? "Выбор ответа" : "Короткий ответ"}
                </span>
            </div>

            <h2>{task.prompt}</h2>

            {task.code !== undefined && (
                <pre className="code-sample"><code>{task.code}</code></pre>
            )}

            {task.kind === "single-choice" ? (
                <fieldset className="answer-fieldset">
                    <legend>Выберите один вариант</legend>
                    <div className="options-list">
                        {task.options.map((option) => (
                            <label className="option" key={option.id}>
                                <input
                                    checked={
                                        answer?.kind === "single-choice" &&
                                        answer.optionId === option.id
                                    }
                                    name={`answer-${task.id}`}
                                    disabled={isBusy}
                                    onChange={() =>
                                        onAnswerChange({
                                            taskId: task.id,
                                            kind: "single-choice",
                                            optionId: option.id,
                                        })
                                    }
                                    type="radio"
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            ) : (
                <label className="text-answer-label" htmlFor={`answer-${task.id}`}>
                    Ваш ответ
                    <textarea
                        id={`answer-${task.id}`}
                        disabled={isBusy}
                        onChange={(event) =>
                            onAnswerChange({
                                taskId: task.id,
                                kind: "short-text",
                                text: event.currentTarget.value,
                            })
                        }
                        placeholder="Введите короткий ответ"
                        rows={5}
                        value={answer?.kind === "short-text" ? answer.text : ""}
                    />
                </label>
            )}
            <button
                className="secondary-button clear-answer-button"
                disabled={isBusy || answer === undefined}
                onClick={onClearAnswer}
                type="button"
            >
                Очистить ответ
            </button>
            <div className="answer-save-row">
                <button
                    className="primary-button"
                    disabled={isBusy || !isPending}
                    onClick={onSaveAnswer}
                    type="button"
                >
                    {isBusy ? "Сохранение..." : "Сохранить на сервере"}
                </button>
                <span role="status">
                    {isPending
                        ? "Есть локальные изменения, не подтверждённые сервером."
                        : isConfirmed
                          ? "Ответ подтверждён сервером."
                          : "Ответ пока не сохранён."}
                </span>
            </div>
        </article>
    );
}

function getAnswerText(task: Task, answer: Answer | undefined): string {
    if (task.kind === "single-choice" && answer?.kind === "single-choice") {
        return task.options.find((option) => option.id === answer.optionId)?.label ?? "Не заполнено";
    }

    if (task.kind === "short-text" && answer?.kind === "short-text" && isAnswered(answer)) {
        return answer.text;
    }

    return "Не заполнено";
}

type DraftReviewProps = {
    trainingSet: TrainingSet;
    answers: Answer[];
    pendingCount: number;
    isBusy: boolean;
    onClearAnswer: (taskId: string) => void;
    onEdit: (index: number) => void;
    onReturn: () => void;
    onSubmit: () => void;
};

function DraftReview({
    trainingSet,
    answers,
    pendingCount,
    isBusy,
    onClearAnswer,
    onEdit,
    onReturn,
    onSubmit,
}: DraftReviewProps) {
    return (
        <section className="submitted-view draft-review-view" aria-labelledby="draft-title">
            <p className="eyebrow">Черновик попытки</p>
            <h2 id="draft-title">Проверьте ответы перед завершением</h2>
            <p>Перед отправкой неподтверждённые изменения будут сохранены на сервере.</p>

            <ol className="review-list">
                {trainingSet.tasks.map((task, index) => {
                    const answer = answers.find((item) => item.taskId === task.id);

                    return (
                        <li className="review-item" key={task.id}>
                            <span className="review-topic">
                                Задание {index + 1} · {task.topic}
                            </span>
                            <h3>{task.prompt}</h3>
                            <p className={answer === undefined ? "is-unanswered" : ""}>
                                {getAnswerText(task, answer)}
                            </p>
                            <div className="review-item-actions">
                                <button
                                    className="secondary-button"
                                    disabled={isBusy}
                                    onClick={() => onEdit(index)}
                                    type="button"
                                >
                                    Изменить ответ
                                </button>
                                <button
                                    className="secondary-button"
                                    disabled={isBusy || answer === undefined}
                                    onClick={() => onClearAnswer(task.id)}
                                    type="button"
                                    aria-label={`Очистить ответ на задание ${index + 1}`}
                                >
                                    Очистить ответ
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ol>

            <div className="draft-review-actions">
                <button className="secondary-button" disabled={isBusy} onClick={onReturn} type="button">
                    Вернуться к заданиям
                </button>
                <button className="primary-button" disabled={isBusy} onClick={onSubmit} type="button">
                    {isBusy
                        ? "Отправка..."
                        : pendingCount > 0
                          ? "Сохранить ответы и отправить"
                          : "Отправить попытку"}
                </button>
            </div>
        </section>
    );
}

function SubmittedOverview({
    trainingSet,
    result,
    isBusy,
    onRestart,
}: {
    trainingSet: TrainingSet;
    result: AttemptResult | null;
    isBusy: boolean;
    onRestart: () => void;
}) {
    return (
        <section className="submitted-view" aria-labelledby="submitted-title">
            <p className="eyebrow">Результат сервера</p>
            <h2 id="submitted-title">
                {result?.status === "pending-review" ? "Ожидает проверки" : "Попытка отправлена"}
            </h2>
            <p>
                Статус попытки: submitted. Статус результата: {result?.status ?? "недоступен"}.
            </p>
            <p>
                {result && result.score === null
                    ? `Оценка ожидает проверки. Максимум: ${result.maxScore}.`
                    : result
                      ? `Результат: ${result.score} из ${result.maxScore}.`
                      : "Результат загружается."}
            </p>

            <ol className="review-list">
                {trainingSet.tasks.map((task, index) => {
                    const item = result?.items.find((resultItem) => resultItem.taskId === task.id);

                    return (
                        <li className="review-item" key={task.id}>
                            <span className="review-topic">
                                Задание {index + 1} · {task.topic}
                            </span>
                            <h3>{task.prompt}</h3>
                            <p>
                                {item?.score === null
                                    ? "Ожидает проверки"
                                    : item
                                      ? `${item.score} из ${item.maxScore}`
                                      : "Результат недоступен"}
                            </p>
                            {item && <p>{item.feedback}</p>}
                        </li>
                    );
                })}
            </ol>

            <button className="primary-button" disabled={isBusy} onClick={onRestart} type="button">
                Начать новую попытку
            </button>
        </section>
    );
}

export default function App() {
    const [attempt, dispatch] = useReducer(attemptReducer, initialAttempt);
    const [trainingSet, setTrainingSet] = useState<TrainingSet>(emptyTrainingSet);
    const [apiState, setApiState] = useState<"loading" | "ready" | "error">("loading");
    const [apiError, setApiError] = useState<string | null>(null);
    const [failedAction, setFailedAction] = useState<
        { type: "save"; taskId: string } | { type: "submit" } | null
    >(null);
    const [isBusy, setIsBusy] = useState(false);
    const [screen, setScreen] = useState<"questions" | "draft">("questions");
    const [draftIssue, setDraftIssue] = useState<string | null>(null);
    const [storageWarning, setStorageWarning] = useState<string | null>(null);
    const { answers, confirmedAnswers, pendingChanges, currentIndex, status } = attempt;
    const pendingCount = Object.keys(pendingChanges).length;

    async function loadSession() {
        if (isBusy) {
            return;
        }
        setIsBusy(true);
        setApiState("loading");
        setApiError(null);
        setFailedAction(null);
        try {
            const setsResponse = await apiRequest("/api/sets");
            if (
                !Array.isArray(setsResponse) ||
                setsResponse.length === 0 ||
                !isRecord(setsResponse[0]) ||
                typeof setsResponse[0].id !== "string"
            ) {
                throw new Error("Сервер не предоставил доступных наборов заданий.");
            }
            const selectedSet = parseTrainingSet(
                await apiRequest(`/api/sets/${encodeURIComponent(setsResponse[0].id)}`),
            );
            setTrainingSet(selectedSet);

            let draft: Draft | null = null;
            let stored: string | null = null;
            try {
                stored = window.localStorage.getItem(draftStorageKey);
            } catch {
                setStorageWarning("Хранилище недоступно. Ввод сохранится только в этой вкладке.");
            }
            if (stored !== null) {
                let parsed: unknown;
                try {
                    parsed = JSON.parse(stored);
                } catch {
                    setDraftIssue("Черновик повреждён: не удалось прочитать JSON.");
                }
                if (parsed !== undefined) {
                    const validation = validateDraft(parsed, selectedSet);
                    if (validation.valid) {
                        draft = validation.draft;
                    } else {
                        setDraftIssue(validation.message);
                    }
                }
            }

            let serverAttempt: ApiAttempt;
            if (draft?.attemptId) {
                serverAttempt = parseApiAttempt(
                    await apiRequest(`/api/attempts/${encodeURIComponent(draft.attemptId)}`),
                    selectedSet,
                );
            } else {
                serverAttempt = parseApiAttempt(
                    await apiRequest("/api/attempts", {
                        method: "POST",
                        body: JSON.stringify({ setId: selectedSet.id }),
                    }),
                    selectedSet,
                );
            }

            const localChanges =
                draft?.pendingChanges ??
                (draft && !draft.attemptId
                    ? Object.fromEntries(draft.answers.map((answer) => [answer.taskId, answer]))
                    : {});
            const reconciledChanges = reconcilePendingChanges(serverAttempt.answers, localChanges);
            let result: AttemptResult | null = null;
            if (serverAttempt.status === "submitted") {
                result = parseAttemptResult(
                    await apiRequest(`/api/attempts/${encodeURIComponent(serverAttempt.id)}/result`),
                    selectedSet,
                );
            }

            dispatch({
                type: "sessionReady",
                attempt: serverAttempt,
                pendingChanges: serverAttempt.status === "submitted" ? {} : reconciledChanges,
                currentIndex: Math.max(
                    0,
                    selectedSet.tasks.findIndex((task) => task.id === draft?.taskId),
                ),
                result,
            });
            setApiState("ready");
        } catch (error) {
            setApiError(error instanceof Error ? error.message : "Не удалось загрузить данные API.");
            setApiState("error");
        } finally {
            setIsBusy(false);
        }
    }

    useEffect(() => {
        void loadSession();
    }, []);

    useEffect(() => {
        if (apiState !== "ready" || !trainingSet || draftIssue !== null || !attempt.attemptId) {
            return;
        }

        const draft: Draft = {
            version: 1,
            setId: trainingSet.id,
            taskId: trainingSet.tasks[currentIndex]?.id ?? "",
            answers,
            status,
            attemptId: attempt.attemptId,
            pendingChanges,
        };
        try {
            window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
            setStorageWarning(null);
        } catch {
            setStorageWarning("Черновик не сохранён: хранилище недоступно. Ввод продолжается.");
        }
    }, [answers, apiState, attempt.attemptId, currentIndex, draftIssue, pendingChanges, status, trainingSet]);

    async function performServerChange(taskId: string, change: Answer | null): Promise<boolean> {
        if (!attempt.attemptId) {
            return false;
        }
        setIsBusy(true);
        setApiError(null);
        setFailedAction(null);
        try {
            const updatedAttempt = parseApiAttempt(
                await apiRequest(
                    `/api/attempts/${encodeURIComponent(attempt.attemptId)}/answers/${encodeURIComponent(taskId)}`,
                    change === null
                        ? { method: "DELETE" }
                        : { method: "PUT", body: JSON.stringify(change) },
                ),
                trainingSet,
            );
            dispatch({ type: "serverSynced", attempt: updatedAttempt, taskId });
            return true;
        } catch (error) {
            setApiError(error instanceof Error ? error.message : "Не удалось сохранить ответ.");
            setFailedAction({ type: "save", taskId });
            return false;
        } finally {
            setIsBusy(false);
        }
    }

    async function persistPendingChange(taskId: string): Promise<boolean> {
        const change = pendingChanges[taskId];
        if (change === undefined) {
            setApiError(null);
            setFailedAction(null);
            return true;
        }
        if (change !== null && !isAnswered(change)) {
            setApiError("Пустой ответ не отправлен. Введите текст или очистите ответ.");
            setFailedAction(null);
            return false;
        }
        return performServerChange(taskId, change);
    }

    async function submitAttempt() {
        if (!trainingSet || !attempt.attemptId || isBusy) {
            return;
        }
        setIsBusy(true);
        setApiError(null);
        setFailedAction(null);
        let savingTaskId: string | null = null;
        try {
            for (const taskId of Object.keys(pendingChanges)) {
                const change = pendingChanges[taskId];
                if (change !== null && !isAnswered(change)) {
                    setApiError("Пустой ответ не отправлен. Введите текст или очистите ответ.");
                    return;
                }
                savingTaskId = taskId;
                const updatedAttempt = parseApiAttempt(
                    await apiRequest(
                        `/api/attempts/${encodeURIComponent(attempt.attemptId)}/answers/${encodeURIComponent(taskId)}`,
                        change === null
                            ? { method: "DELETE" }
                            : { method: "PUT", body: JSON.stringify(change) },
                    ),
                    trainingSet,
                );
                dispatch({ type: "serverSynced", attempt: updatedAttempt, taskId });
            }
            savingTaskId = null;
            const result = parseAttemptResult(
                await apiRequest(`/api/attempts/${encodeURIComponent(attempt.attemptId)}/submit`, {
                    method: "POST",
                    body: JSON.stringify({}),
                }),
                trainingSet,
            );
            dispatch({ type: "submitted", result });
        } catch (error) {
            setApiError(error instanceof Error ? error.message : "Не удалось отправить попытку.");
            setFailedAction(savingTaskId ? { type: "save", taskId: savingTaskId } : { type: "submit" });
        } finally {
            setIsBusy(false);
        }
    }

    async function retryFailedAction() {
        if (failedAction?.type === "save") {
            await persistPendingChange(failedAction.taskId);
        } else if (failedAction?.type === "submit") {
            await submitAttempt();
        }
    }

    function clearAnswer(taskId: string) {
        const isConfirmed = confirmedAnswers.some((answer) => answer.taskId === taskId);
        dispatch({ type: "answerCleared", taskId });
        if (isConfirmed) {
            void performServerChange(taskId, null);
        }
    }

    const currentTask = trainingSet.tasks[currentIndex];
    const currentAnswer = currentTask
        ? answers.find((answer) => answer.taskId === currentTask.id)
        : undefined;
    const progress = calculateProgress(trainingSet, answers);
    const unansweredTasks = trainingSet.tasks.filter(
        (task) => !isAnswered(answers.find((answer) => answer.taskId === task.id)),
    );

    function openDraftReview() {
        const missingTasks = unansweredTasks.map((task) => {
            const index = trainingSet.tasks.indexOf(task);
            return `${index + 1} (${task.id})`;
        });
        const message =
            missingTasks.length > 0
                ? `Без ответа остались задания: ${missingTasks.join(", ")}. Перейти к проверке черновика?`
                : null;

        if (message === null || window.confirm(message)) {
            setScreen("draft");
        }
    }

    async function resetAttempt() {
        dispatch({ type: "reset" });
        setScreen("questions");
        setDraftIssue(null);
        try {
            window.localStorage.removeItem(draftStorageKey);
            setStorageWarning(null);
        } catch {
            setStorageWarning("Память сброшена; хранилище сейчас недоступно.");
        }
        await loadSession();
    }

    return (
        <main className="app-shell">
            <header className="page-header">
                <a className="brand" href="#main" aria-label="Тренажёр — к содержимому">
                    <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
                    <span>Тренажёр</span>
                </a>
                <span className="header-note">Практика веб-разработки</span>
            </header>

            <section className="intro" id="main" aria-labelledby="set-title">
                <div className="intro-copy">
                    <p className="eyebrow">Учебный API</p>
                    <h1 id="set-title">{trainingSet.title || "Загрузка набора..."}</h1>
                    <p className="intro-description">
                        Неподтверждённый ввод хранится локально; подтверждённые ответы и результат — на сервере.
                    </p>
                </div>
                <div className="count-card" aria-label={`Прогресс: ${progress.answered} из ${progress.total}`}>
                    <span className="count-value">{progress.answered}/{progress.total}</span>
                    <span className="count-label">заполнено</span>
                </div>
            </section>

            {draftIssue !== null && (
                <section className="draft-notice draft-notice-error" role="alert">
                    <p>{draftIssue} Данные не восстановлены.</p>
                    <button className="primary-button" disabled={isBusy} onClick={resetAttempt} type="button">
                        Сбросить черновик
                    </button>
                </section>
            )}
            {storageWarning !== null && (
                <p className="draft-notice" role="status">{storageWarning}</p>
            )}

            {apiState !== "ready" ? (
                <section className={`draft-notice${apiError ? " draft-notice-error" : ""}`} role={apiError ? "alert" : "status"}>
                    <p>{apiError ?? "Загружаем набор и восстанавливаем попытку..."}</p>
                    {apiError && (
                        <button className="primary-button" onClick={() => void loadSession()} type="button">
                            Повторить загрузку
                        </button>
                    )}
                </section>
            ) : status === "submitted" ? (
                <SubmittedOverview
                    trainingSet={trainingSet}
                    result={attempt.result}
                    isBusy={isBusy}
                    onRestart={() => void resetAttempt()}
                />
            ) : screen === "draft" ? (
                <DraftReview
                    trainingSet={trainingSet}
                    answers={answers}
                    pendingCount={pendingCount}
                    isBusy={isBusy}
                    onClearAnswer={clearAnswer}
                    onEdit={(index) => {
                        dispatch({ type: "moved", index, maxIndex: trainingSet.tasks.length - 1 });
                        setScreen("questions");
                    }}
                    onReturn={() => setScreen("questions")}
                    onSubmit={() => void submitAttempt()}
                />
            ) : (
                <>
                    <section className="progress-section" aria-label="Прогресс попытки">
                        <div className="progress-copy">
                            <span>Прогресс</span>
                            <span>{progress.answered} из {progress.total} ответов</span>
                        </div>
                        <progress
                            aria-label="Заполненные задания"
                            max={progress.total || 1}
                            value={progress.answered}
                        />
                    </section>

                    <div className="workspace">
                        <section className="catalog-panel" aria-labelledby="catalog-title">
                            <div className="section-heading">
                                <h2 id="catalog-title">Задания</h2>
                                <span>{trainingSet.tasks.length}</span>
                            </div>
                            <TaskList
                                answers={answers}
                                currentIndex={currentIndex}
                                isBusy={isBusy}
                                onChoose={(index) =>
                                    dispatch({
                                        type: "moved",
                                        index,
                                        maxIndex: trainingSet.tasks.length - 1,
                                    })
                                }
                                tasks={trainingSet.tasks}
                            />
                        </section>

                        <section
                            className="detail-panel"
                            aria-label="Текущее задание"
                            aria-live="polite"
                        >
                            {currentTask ? (
                                <>
                                    <p className="question-count">
                                        Задание {currentIndex + 1} из {trainingSet.tasks.length}
                                    </p>
                                    <TaskForm
                                        answer={currentAnswer}
                                        isPending={currentTask.id in pendingChanges}
                                        isConfirmed={confirmedAnswers.some(
                                            (answer) => answer.taskId === currentTask.id,
                                        )}
                                        isBusy={isBusy}
                                        onAnswerChange={(answer) =>
                                            dispatch({ type: "answerChanged", answer })
                                        }
                                        onSaveAnswer={() => void persistPendingChange(currentTask.id)}
                                        onClearAnswer={() => clearAnswer(currentTask.id)}
                                        task={currentTask}
                                    />
                                    <div className="task-navigation">
                                        <button
                                            disabled={isBusy || currentIndex === 0}
                                            onClick={() =>
                                                dispatch({
                                                    type: "moved",
                                                    index: currentIndex - 1,
                                                    maxIndex: trainingSet.tasks.length - 1,
                                                })
                                            }
                                            type="button"
                                        >
                                            Назад
                                        </button>
                                        <button
                                            disabled={isBusy || currentIndex === trainingSet.tasks.length - 1}
                                            onClick={() =>
                                                dispatch({
                                                    type: "moved",
                                                    index: currentIndex + 1,
                                                    maxIndex: trainingSet.tasks.length - 1,
                                                })
                                            }
                                            type="button"
                                        >
                                            {isAnswered(currentAnswer)
                                                ? "Далее"
                                                : "Пропустить задание"}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <h2>В этом наборе пока нет заданий</h2>
                                </div>
                            )}
                        </section>
                    </div>

                    {unansweredTasks.length > 0 && (
                        <section className="skipped-section" aria-labelledby="skipped-title">
                            <h2 id="skipped-title">Незаполненные задания</h2>
                            <ul>
                                {unansweredTasks.map((task) => {
                                    const index = trainingSet.tasks.indexOf(task);
                                    return (
                                        <li key={task.id}>
                                            <button
                                                disabled={isBusy}
                                                onClick={() =>
                                                    dispatch({
                                                        type: "moved",
                                                        index,
                                                        maxIndex: trainingSet.tasks.length - 1,
                                                    })
                                                }
                                                type="button"
                                            >
                                                Задание {index + 1}: {task.topic}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}

                    <div className="finish-actions">
                        <button
                            className="primary-button"
                            disabled={isBusy}
                            onClick={openDraftReview}
                            type="button"
                        >
                            Перейти к черновику
                        </button>
                    </div>

                </>
            )}

            {apiError !== null && apiState === "ready" && (
                <section className="draft-notice draft-notice-error" role="alert">
                    <p>{apiError} Локальный ввод сохранён; серверные данные не считаются подтверждёнными.</p>
                    {failedAction && (
                        <button
                            className="primary-button"
                            disabled={isBusy}
                            onClick={() => void retryFailedAction()}
                            type="button"
                        >
                            Повторить запрос
                        </button>
                    )}
                </section>
            )}

            <footer className="page-footer">
                <span>Обучение через практику</span>
                <span>Подтверждённые ответы хранятся на сервере</span>
            </footer>
        </main>
    );
}
