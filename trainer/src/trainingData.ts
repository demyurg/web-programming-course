import rawTrainingSet from "../../course/data/training-set.json";
import type { Task, TrainingSet } from "./domain";

const tasks: Task[] = rawTrainingSet.tasks.map((task): Task => {
  if (task.kind === "single-choice" && "options" in task && task.options) {
    return { ...task, kind: "single-choice" };
  }

  if (task.kind === "short-text") {
    return { ...task, kind: "short-text" };
  }

  throw new Error(`Неизвестный вид задания: ${task.id}`);
});

export const trainingSet: TrainingSet = {
  id: rawTrainingSet.id,
  title: rawTrainingSet.title,
  tasks
};