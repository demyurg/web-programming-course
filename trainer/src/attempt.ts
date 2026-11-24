import type { Answer } from "./domain";

type AttemptStatus = "in-progress" | "submitted"

export type AttemptState = {
    answers: Answer[]
    status: AttemptStatus
}

export const initialAttemptState: AttemptState = {
    answers: [],
    status: "in-progress"
}

export type AttemptAction = 
{type: "answerChanged"; answer: Answer} | 
{type: "answerCleared"; taskId: string} |
{type: "reset"} |
{type: "submitted"}


export function attemptReducer(state: AttemptState, action: AttemptAction): AttemptState{
    if (action.type === "reset") {
        return initialAttemptState
    }

    if (state.status === "submitted") {
        return state
    }

    switch (action.type) {
        case "submitted": {
            return {...state, status: "submitted"}
        }

        case "answerChanged": {
            const remainingAnswers = state.answers.filter((answer) => answer.taskId !== action.answer.taskId)
            const changeAnswer = [...remainingAnswers, action.answer]
            return {...state, answers: changeAnswer}    
        }
        
        case "answerCleared": {
            const changeAnswer = state.answers.filter((answer) => answer.taskId !== action.taskId)
            return {...state, answers: changeAnswer}
        }
    }
}