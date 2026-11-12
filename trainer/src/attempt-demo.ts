import { webBasics } from "./data";
import type { AttemptState } from "./attempt";
import {
  attemptReducer,
  createAttempt,
  getMissingTasks,
  getProgress,
} from "./attempt";

function show(label: string, state: AttemptState): void {
  const progress = getProgress(state);
  const missing = getMissingTasks(state).map((task) => task.id).join(", ");
  console.log(
    `${label}: статус ${state.status}, заполнено ${progress.answered} из ${progress.total}, пропуски: ${missing || "нет"}`,
  );
}

const start = createAttempt(webBasics);
const startBefore = JSON.stringify(start);
show("Старт", start);

const s1 = attemptReducer(start, {
  type: "answer",
  answer: { taskId: "ts-1", kind: "single-choice", optionId: "b" },
});
show("Ответ на ts-1", s1);

const s2 = attemptReducer(s1, {
  type: "answer",
  answer: { taskId: "react-1", kind: "short-text", text: "Props приходят снаружи" },
});
show("Ответ на react-1", s2);

const s3 = attemptReducer(s2, { type: "clear", taskId: "react-1" });
show("Очистка react-1", s3);

const s4 = attemptReducer(s3, {
  type: "answer",
  answer: { taskId: "react-1", kind: "short-text", text: "   " },
});
show("Текст из пробелов", s4);

const wrongKind = attemptReducer(s4, {
  type: "answer",
  answer: { taskId: "ts-1", kind: "short-text", text: "не тот вид" },
});
console.log("Ответ не того вида отклонён:", wrongKind === s4);

const s5 = attemptReducer(s4, { type: "request-finish" });
show("Запрос завершения", s5);

const s6 = attemptReducer(s5, { type: "cancel-finish" });
show("Отмена", s6);
console.log("Ответы после отмены не изменились:", s6.answers === s5.answers);

const s7 = attemptReducer(s6, { type: "confirm-finish" });
show("Подтверждение", s7);

const afterAnswer = attemptReducer(s7, {
  type: "answer",
  answer: { taskId: "ts-1", kind: "single-choice", optionId: "a" },
});
console.log("Ответ после submitted отклонён:", afterAnswer === s7);

const afterClear = attemptReducer(s7, { type: "clear", taskId: "ts-1" });
console.log("Очистка после submitted отклонена:", afterClear === s7);

const s8 = attemptReducer(s7, { type: "restart" });
show("Новая попытка", s8);

console.log("Исходное состояние не изменилось:", JSON.stringify(start) === startBefore);
