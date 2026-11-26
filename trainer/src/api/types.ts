import type { Answer } from "../domain/domain.js";


export type SetSummary = {
    id: string;
    title: string;
    taskCount: number;
};

export type AttemptStatus = "in-progress" | "submitted";

export type ResultStatus = "graded" | "pending-review";

export type Attempt = {
    id: string;
    setId: string;
    status: AttemptStatus;
    answers: Answer[];
};

export type ResultItem = {
    taskId: string;
    status: "correct" | "incorrect" | "unanswered" | "pending-review";
    score: number | null;
    maxScore: number;
    feedback:string;

}

export type Result = {
    attemptId: string;
    status: ResultStatus;
    score: number | null;
    maxScore: number;
    items: ResultItem[];
};

export type ApiErrorBody = {
    error: { code: string; message: string};


}

