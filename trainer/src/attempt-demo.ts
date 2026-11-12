import type { Answer, TrainingSet } from "./domain";
import { countProgress } from "./domain";
import {
  attemptReducer,
  clearAnswer,
  createAttempt,
  getUnfilledTasks,
  setAnswer,
  submitAttempt,
} from "./attempt";

function check(name: string, condition: boolean): void {
  if (!condition) {
    throw new Error(`FAIL: ${name}`);
  }
  console.log(`OK   ${name}`);
}

const set: TrainingSet = {
  id: "demo",
  title: "Демо",
  tasks: [
    {
      id: "t-1",
      kind: "single-choice",
      topic: "x",
      prompt: "Вопрос 1",
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    },
    { id: "t-2", kind: "short-text", topic: "x", prompt: "Вопрос 2" },
  ],
};

const choiceA: Answer = { taskId: "t-1", kind: "single-choice", optionId: "a" };
const choiceB: Answer = { taskId: "t-1", kind: "single-choice", optionId: "b" };
const text: Answer = { taskId: "t-2", kind: "short-text", text: "мой ответ" };
const blank: Answer = { taskId: "t-2", kind: "short-text", text: "   " };

const start = createAttempt();
const snapshot = JSON.stringify(start);
check("новая попытка: in-progress и нет ответов", start.status === "in-progress" && start.answers.length === 0);

const one = setAnswer(start, choiceA);
check("setAnswer не изменил исходную попытку", JSON.stringify(start) === snapshot);
check("после setAnswer есть 1 ответ", one.answers.length === 1);

const replaced = setAnswer(one, choiceB);
check("повторный ответ заменяет прежний (всё ещё 1)", replaced.answers.length === 1);
check("в ответе новый вариант b", replaced.answers[0]?.kind === "single-choice" && replaced.answers[0].optionId === "b");

const both = setAnswer(one, text);
check("прогресс 2 из 2", countProgress(set, both.answers).answered === 2);
check("пропусков нет", getUnfilledTasks(set, both.answers).length === 0);

const withBlank = setAnswer(one, blank);
check("пробельный текст не засчитан: 1 из 2", countProgress(set, withBlank.answers).answered === 1);
check("пропущено задание t-2", getUnfilledTasks(set, withBlank.answers)[0]?.id === "t-2");

const cleared = clearAnswer(both, "t-1");
check("clearAnswer убрал ответ t-1", cleared.answers.length === 1 && cleared.answers[0]?.taskId === "t-2");
check("после очистки прогресс 1 из 2", countProgress(set, cleared.answers).answered === 1);
check("после очистки t-1 в пропусках", getUnfilledTasks(set, cleared.answers)[0]?.id === "t-1");
check("очистка несуществующего ответа ничего не ломает", clearAnswer(start, "t-1").answers.length === 0);
check("clearAnswer не изменил исходную попытку", both.answers.length === 2);

const done = submitAttempt(both);
check("submit ставит статус submitted", done.status === "submitted");
check("submit сохранил ответы", done.answers.length === 2);

check("setAnswer после submitted ничего не меняет", setAnswer(done, choiceB) === done);
check("clearAnswer после submitted ничего не меняет", clearAnswer(done, "t-1") === done);
check("повторный submit ничего не меняет", submitAttempt(done) === done);

check("reducer: set-answer", attemptReducer(start, { type: "set-answer", answer: choiceA }).answers.length === 1);
check("reducer: clear-answer", attemptReducer(both, { type: "clear-answer", taskId: "t-2" }).answers.length === 1);
check("reducer: submit", attemptReducer(both, { type: "submit" }).status === "submitted");
check("reducer отклоняет set-answer после submitted", attemptReducer(done, { type: "set-answer", answer: choiceB }) === done);
check("reducer отклоняет clear-answer после submitted", attemptReducer(done, { type: "clear-answer", taskId: "t-1" }) === done);

const restarted = attemptReducer(done, { type: "restart" });
check("restart: новая попытка без ответов", restarted.status === "in-progress" && restarted.answers.length === 0);

console.log("Все проверки правил попытки пройдены");
