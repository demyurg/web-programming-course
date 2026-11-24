import { attemptReducer, type AttemptState } from "./attempt";

let state: AttemptState = { status: "in-progress" as const, answers: [] };
console.log("Начало:", state);

state = attemptReducer(state, {
  type: "CHANGE_ANSWER",
  answer: { taskId: "ts-1", kind: "single-choice", optionId: "b" }
});

state = attemptReducer(state, {
  type: "CHANGE_ANSWER",
  answer: { taskId: "react-2", kind: "single-choice", optionId: "a" }
});
console.log("После добавления ответа:", state);

state = attemptReducer(state, {
  type: "CHANGE_ANSWER",
  answer: { taskId: "react-2", kind: "single-choice", optionId: "c" }
});
console.log("После замены ответа:", state);

state = attemptReducer(state, { type: "SUBMIT" });
console.log("После завершения:", state);

state = attemptReducer(state, {
  type: "CHANGE_ANSWER",
  answer: { taskId: "react-1", kind: "short-text", text: "Попытка взлома" }
});
console.log("Попытка изменить после сдачи:", state);