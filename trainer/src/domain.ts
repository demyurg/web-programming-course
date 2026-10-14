// типы для заданий
export type SingleChoiceTask = {
  id: string;
  kind: "single-choice";
  topic: string;
  text: string;
  options: string[];
  code?: string;
};

export type ShortTextTask = {
  id: string;
  kind: "short-text";
  topic: string;
  text: string;
  code?: string;
};

// задание может быть с выбором или текстовым
export type Task = SingleChoiceTask | ShortTextTask;

// типы для ответов
export type ChoiceAnswer = {
  taskId: string;
  kind: "single-choice";
  optionId: string;
};

export type TextAnswer = {
  taskId: string;
  kind: "short-text";
  text: string;
};

export type Answer = ChoiceAnswer | TextAnswer;

// тип для набора заданий
export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

// поиск задания по ID возвращает задание или undefined
export function findTaskById(set: TrainingSet, id: string): Task | undefined {
  return set.tasks.find((task) => task.id === id);
}

// фильтрация заданий по теме возвращает новый массив
export function filterTasksByTopic(set: TrainingSet, topic: string): Task[] {
  const lowerTopic = topic.toLowerCase();
  return set.tasks.filter((task) => task.topic.toLowerCase().includes(lowerTopic));
}

// подсчет прогресса заполнено или всего
export function calculateProgress(set: TrainingSet, answers: Answer[]): { filled: number; total: number } {
  const total = set.tasks.length;
  
  const filled = set.tasks.filter((task) => {
    // Ищем ответ который соответствует ID этого задания
    const answer = answers.find((a) => a.taskId === task.id);
    
    // если ответа нет вообще задание не заполнено
    if (!answer) return false;

    // если задание текстовое, проверяем, что там не одни пробелы
    if (task.kind === "short-text" && answer.kind === "short-text") {
      return answer.text.trim() !== ""; 
    }
    
    // для задания с выбором ответа сам факт наличия ответа уже считается заполнением
    return true;
  }).length;

  return { filled, total };
}