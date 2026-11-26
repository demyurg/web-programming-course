import type { Answer, Task } from "./domain";
import { isAnswerFilled } from "./domain";
import type { ItemStatus, Result, ResultItem, ResultStatus } from "./server-model";


export function describeAnswer(task: Task, answer: Answer | undefined): string {
  if (answer === undefined || !isAnswerFilled(answer)) {
    return "не заполнено";
  }
  if (answer.kind === "single-choice") {
    const optionId = answer.optionId;
    const option =
      task.kind === "single-choice"
        ? task.options.find((item) => item.id === optionId)
        : undefined;
    return option ? `${option.id}) ${option.label}` : optionId;
  }
  return answer.text;
}

export function formatScore(score: number | null, maxScore: number): string {
  return score === null ? "ожидает проверки" : `${score} из ${maxScore}`;
}

export function describeItemStatus(status: ItemStatus): string {
  switch (status) {
    case "correct":
      return "верно";
    case "incorrect":
      return "неверно";
    case "unanswered":
      return "нет ответа";
    case "pending-review":
      return "ожидает проверки";
  }
}

export function describeResultStatus(status: ResultStatus): string {
  return status === "graded" ? "проверено" : "ожидает проверки";
}

export function findResultItem(result: Result, taskId: string): ResultItem | undefined {
  return result.items.find((item) => item.taskId === taskId);
}
