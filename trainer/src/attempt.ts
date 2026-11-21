import type { Answer } from "./domain";
import { trainingSet } from "./trainingSet";

export type AttemptStatus = "in-progress" | "submitted";

export type AttemptState = {
    answers: Answer[];
    currentIndex: number;
    status: AttemptStatus;
    confirming: boolean;
};

export type Draft = {
    version: 1;
    setId: string;
    taskId: string;
    answers: Answer[];
    status: AttemptStatus;
};

export type AttemptAction =
    | { type: "answerChanged"; answer: Answer }
    | { type: "answerCleared"; taskId: string }
    | { type: "moved"; index: number }
    | { type: "restored"; draft: Draft }
    | { type: "reset" }
    | { type: "finishRequested" }
    | { type: "finishCanceled" }
    | { type: "submitted" };

export const initialAttemptState: AttemptState = {
    answers: [],
    currentIndex: 0,
    status: "in-progress",
    confirming: false,
};

export function attemptReducer(
    state: AttemptState,
    action: AttemptAction
): AttemptState {
    switch (action.type) {
        case "answerChanged":
            if (state.status === "submitted") return state;
            if (!trainingSet.tasks.some((task) => task.id === action.answer.taskId && task.kind === action.answer.kind)) return state;
            return {
                ...state,
                answers: [
                    ...state.answers.filter(
                        (answer) => answer.taskId !== action.answer.taskId
                    ),
                    action.answer,
                ],
            };

        case "answerCleared":
            if (state.status === "submitted") return state;
            if (!state.answers.some((answer) => answer.taskId === action.taskId)) return state;
            return {
                ...state,
                answers: state.answers.filter((answer) => answer.taskId !== action.taskId),
            };

        case "moved":
            if (state.status === "submitted") return state;
            return {
                ...state,
                currentIndex: Math.max(
                    0,
                    Math.min(action.index, trainingSet.tasks.length - 1)
                ),
            };

        case "restored": {
            const index = trainingSet.tasks.findIndex(
                (task) => task.id === action.draft.taskId
            );
            return {
                answers: action.draft.answers,
                currentIndex: index >= 0 ? index : 0,
                status: action.draft.status,
                confirming: false,
            };
        }

        case "reset":
            return initialAttemptState;

        case "finishRequested":
            return state.status === "submitted"
                ? state
                : { ...state, confirming: true };

        case "finishCanceled":
            return { ...state, confirming: false };

        case "submitted":
            return state.status === "in-progress" && state.confirming
                ? { ...state, status: "submitted", confirming: false }
                : state;
    }
}
