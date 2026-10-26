import { useState } from "react";
import type { Answer, TrainingSet } from "./domain";
import { TaskCardForm } from "./TaskCardForm";
import { ReviewList } from "./ReviewList";
import { getProgress, isAnswered } from "./domain";

type AttemptScreenProps = {
  set: TrainingSet;
};

export function AttemptScreen({ set }: AttemptScreenProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"in-progress" | "submitted">("in-progress");

  // current - гарантированно актуальное значение. filter - вернет новый массив без старого ответа
  function replaceAnswer(next: Answer) {
    setAnswers((current) => [
      ...current.filter((item) => item.taskId !== next.taskId),
      next,
    ]);
  }

  // index - актуальное значение. В выражении - проверка, чтобы индекс не вылез за пределы
  function goNext() {
    setCurrentIndex((index) => Math.min(index + 1, set.tasks.length - 1));
  }

  function goPrev() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  // Обработка завершения
  function handleFinish() {
    const missedTasks = set.tasks.filter((task) => {
      // Ищем в состоянии answers ответ. find - первый объект массива удовлетворяющий условию
      const answer = answers.find((a) => a.taskId === task.id);
      // Проверка ответа
      return !isAnswered(task, answer);
    });

    let message: string;

    if (missedTasks.length > 0) {
      // Получаем индексы пропущенных заданий (из set) и преобразуем их в строку
      const missedNumbers = missedTasks
        .map((task) => set.tasks.indexOf(task) + 1)
        .join(", ");
      message = `Не заполнены задания под номерами: ${missedNumbers}. Всё равно завершить?`;
    } else {
      message = "Все задания заполнены. Завершить попытку?";
    }

    // Отображаем сообщение. Если нажата Ок - идем дальше, если Отмена - выходим
    if (!window.confirm(message)) return;


    setStatus("submitted");
  }

  // Обработка начала новой попытки
  function handleRestart() {
    setAnswers([]);
    setCurrentIndex(0);
    setStatus("in-progress");
  }

  // Функция написанная на L1 для поиска общего количества и количества выолненных заданий
  const progress = getProgress(set, answers);

  // Задание по текущему индексу
  const currentTask = set.tasks[currentIndex];
  // Нет задания - нет ответа
  const currentAnswer = currentTask // find - первый элемент удовлетворяющий условию
    ? answers.find((a) => a.taskId === currentTask.id)
    : undefined;

  if (!currentTask) {
    return <p>Заданий нет.</p>;
  }

  // Обработка состояния submitted. Отображение компонента с обзором на внесенные ответы
  if (status === "submitted") {
    return (
      <section>
        <h1>{set.title}</h1>
        <p>Попытка завершена.</p>
        <ReviewList set={set} answers={answers} />
        <button type="button" onClick={handleRestart}>
          Начать новую попытку
        </button>
      </section>
    );
  }

  // Отображение задания и кнопок навигации
  return (
    <section>
      <h1>{set.title}</h1>
      <p>
        Задание {currentIndex + 1} из {set.tasks.length}
      </p>
      <p>Статус: {status}</p>
      <p>
        Заполнено {progress.filled} из {progress.total}
      </p>

      <TaskCardForm
        task={currentTask}
        answer={currentAnswer}
        onChange={replaceAnswer}
      />

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button type="button" onClick={goPrev} disabled={currentIndex === 0}>
          Назад
        </button>
        <button
          type="button"
          onClick={goNext}
          // Ограничение возможности нажатия при условии
          disabled={currentIndex === set.tasks.length - 1}
        >
          Далее
        </button>
      </div>

      <button type="button" onClick={handleFinish}>
        Завершить
      </button>
    </section>
  );
}