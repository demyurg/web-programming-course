import { useState } from "react";
import type { TrainingSet, Answer } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";

// Тестовые данные
const mainSet: TrainingSet = {
  id: "set-1",
  title: "Основы TypeScript и React",
  tasks: [
    {
      id: "ts-1",
      kind: "single-choice",
      topic: "TypeScript",
      text: "Какой тип описывает значение, которое может быть строкой или числом?",
      options: ["string | number", "string & number", "any"],
    },
    {
      id: "react-1",
      kind: "short-text",
      topic: "React",
      text: "Напишите название хука для хранения состояния.",
      code: "const [count, setCount] = useState(0);",
    },
  ],
};

// Тип для режима попытки
type AttemptStatus = "in-progress" | "submitted";

// Вспомогательная функция: проверен ли ответ
function isAnswerFilled(answer: Answer | undefined): boolean {
  if (!answer) return false;
  if (answer.kind === "short-text") {
    return answer.text.trim().length > 0;
  }
  return true;
}

export default function App() {
  // Состояние: индекс текущего задания
  const [currentIndex, setCurrentIndex] = useState(0);

  // Состояние: массив ответов
  const [answers, setAnswers] = useState<Answer[]>([]);

  // Состояние: режим попытки
  const [status, setStatus] = useState<AttemptStatus>("in-progress");

  const currentTask = mainSet.tasks[currentIndex];
  const totalCount = mainSet.tasks.length;

  // Функция: обновить или добавить ответ (НЕ МУТИРУЕМ!)
  const updateAnswer = (answer: Answer) => {
    setAnswers((prevAnswers) => {
      const existingIndex = prevAnswers.findIndex((a) => a.taskId === answer.taskId);

      if (existingIndex >= 0) {
        // Заменяем существующий ответ (создаём новый массив!)
        const newAnswers = [...prevAnswers];
        newAnswers[existingIndex] = answer;
        return newAnswers;
      } else {
        // Добавляем новый ответ
        return [...prevAnswers, answer];
      }
    });
  };

  // Функция: получить ответ для задания
  const getAnswer = (taskId: string): Answer | undefined => {
    return answers.find((a) => a.taskId === taskId);
  };

  // ВЫЧИСЛЯЕМ прогресс (производное значение, не храним!)
  const filledCount = mainSet.tasks.filter((task) => {
    const answer = getAnswer(task.id);
    return isAnswerFilled(answer);
  }).length;

  // Функция: перейти к следующему заданию
  const goNext = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Функция: перейти к предыдущему заданию
  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Функция: завершить попытку
  const finishAttempt = () => {
    // Ищем пропущенные задания
    const emptyTasks = mainSet.tasks.filter((task) => {
      const answer = getAnswer(task.id);
      return !isAnswerFilled(answer);
    });

    if (emptyTasks.length > 0) {
      // Если есть пропуски — спрашиваем подтверждение
      const ids = emptyTasks.map((t) => t.id).join(", ");
      const confirmed = window.confirm(
        `Не все задания заполнены. Пропущены: ${ids}. Всё равно завершить?`
      );
      if (!confirmed) return; // Отмена — ничего не делаем
    }

    // Завершаем попытку
    setStatus("submitted");
  };

  // Функция: начать новую попытку
  const restartAttempt = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setStatus("in-progress");
  };

  return (
    <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1>{mainSet.title}</h1>

      {/* Прогресс */}
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Прогресс: {filledCount} из {totalCount}
      </p>

      {/* Если попытка завершена — показываем обзор */}
      {status === "submitted" ? (
        <section style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
          <h2>Попытка завершена</h2>
          <p>Ваши ответы:</p>
          <ul style={{ lineHeight: "1.8" }}>
            {mainSet.tasks.map((task) => {
              const answer = getAnswer(task.id);
              return (
                <li key={task.id}>
                  <strong>{task.topic}:</strong> {task.text}
                  <br />
                  <em>Ответ: </em>
                  {answer
                    ? answer.kind === "single-choice"
                      ? answer.optionId
                      : answer.text || "(пусто)"
                    : "(не отвечено)"}
                </li>
              );
            })}
          </ul>
          <button
            onClick={restartAttempt}
            style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
          >
            Новая попытка
          </button>
        </section>
      ) : (
        /* Если попытка в процессе — показываем задание */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
          <aside>
            <h2>Список заданий</h2>
            <TaskList
              tasks={mainSet.tasks}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
              answers={answers}
            />
          </aside>

          <section>
            <h2>Задание {currentIndex + 1} из {totalCount}</h2>
            {currentTask && (
              <TaskCard
                task={currentTask}
                answer={getAnswer(currentTask.id)}
                onAnswerChange={updateAnswer}
                disabled={false}
              />
            )}

            {/* Кнопки навигации */}
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={goBack}
                disabled={currentIndex === 0}
                style={{ padding: "10px 20px", cursor: "pointer" }}
              >
                Назад
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex === totalCount - 1}
                style={{ padding: "10px 20px", cursor: "pointer" }}
              >
                Далее
              </button>
              <button
                onClick={finishAttempt}
                style={{ padding: "10px 20px", marginLeft: "auto", cursor: "pointer" }}
              >
                Завершить
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}