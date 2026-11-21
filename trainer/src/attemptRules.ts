import type { Answer, Task } from "./domain";

// Проверка, заполнен ли ответ 
export function isAnswerFilled(answer: Answer | undefined): boolean {
  if (!answer) return false;
  if (answer.kind === "short-text") {
    return answer.text.trim().length > 0;
  }
  return true;
}

// Добавить или обновить ответ
export function setAnswer(answers: Answer[], newAnswer: Answer): Answer[] {
  const index = answers.findIndex((a) => a.taskId === newAnswer.taskId);
  if (index >= 0) {
    const next = [...answers];
    next[index] = newAnswer;
    return next;
  }
  return [...answers, newAnswer];
}

// Очистить ответ по taskId
export function clearAnswer(answers: Answer[], taskId: string): Answer[] {
  return answers.filter((a) => a.taskId !== taskId);
}

// Проверка перед завершением: есть ли пропуски
export function trySubmit(tasks: Task[], answers: Answer[]): { ok: true } | { ok: false; missingIds: string[] } {
  const missingIds = tasks
    .filter((task) => {
      const answer = answers.find((a) => a.taskId === task.id);
      return !isAnswerFilled(answer);
    })
    .map((task) => task.id);

  if (missingIds.length > 0) {
    return { ok: false, missingIds };
  }
  return { ok: true };
}