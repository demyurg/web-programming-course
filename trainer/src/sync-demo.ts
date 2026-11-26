import type { Answer, TrainingSet } from "./domain";
import {
  answersEqual,
  attemptReducer,
  createAttempt,
  getSyncStatus,
  getUnsavedTaskIds,
  setAnswer,
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
const text: Answer = { taskId: "t-2", kind: "short-text", text: "ответ" };
const text2: Answer = { taskId: "t-2", kind: "short-text", text: "ответ!" };
const blank: Answer = { taskId: "t-2", kind: "short-text", text: "  " };

check("одинаковые ответы равны", answersEqual(choiceA, { ...choiceA }));
check("разные варианты не равны", !answersEqual(choiceA, choiceB));
check("разные тексты не равны", !answersEqual(text, text2));
check("ответы разных заданий не равны", !answersEqual(choiceA, text));

check("нигде нет ответа: empty", getSyncStatus(undefined, undefined) === "empty");
check("есть только локально: unsaved", getSyncStatus(choiceA, undefined) === "unsaved");
check("локально и на сервере одинаково: saved", getSyncStatus(choiceA, choiceA) === "saved");
check("локально изменили: unsaved", getSyncStatus(text2, text) === "unsaved");
check("локально пробелы, на сервере есть: unsaved", getSyncStatus(blank, text) === "unsaved");
check("локально пробелы, на сервере нет: empty", getSyncStatus(blank, undefined) === "empty");

check("всё сохранено: несохранённых нет", getUnsavedTaskIds(set, [choiceA, text], [choiceA, text]).length === 0);
const unsaved = getUnsavedTaskIds(set, [choiceB, text], [choiceA, text]);
check("изменён t-1: он несохранённый", unsaved.length === 1 && unsaved[0] === "t-1");

const fromServer = { status: "in-progress" as const, answers: [choiceA] };
const loaded = attemptReducer(createAttempt(), { type: "load", attempt: fromServer });
check("load берёт попытку с сервера", loaded === fromServer);
const loadedDone = attemptReducer(createAttempt(), {
  type: "load",
  attempt: { status: "submitted", answers: [choiceA] },
});
check("загруженная завершённая попытка не редактируется", setAnswer(loadedDone, choiceB) === loadedDone);

console.log("Все проверки синхронизации пройдены");
