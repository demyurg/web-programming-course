import { useReducer, useState } from "react";
import type { TrainingSet } from "./domain";
import { getProgress, isAnswered } from "./domain";
import { attemptReducer, getMissedTasks } from "./attempt";
import type { AttemptState } from "./attempt";
import { TaskCardForm } from "./TaskCardForm";
import { ReviewList } from "./ReviewList";

type AttemptScreenProps = {
  set: TrainingSet;
};

const initialState: AttemptState = {
  answers: [],
  currentIndex: 0,
  status: "in-progress",
};

export function AttemptScreen({ set }: AttemptScreenProps) {
  const [state, dispatch] = useReducer(
    (state, action) => attemptReducer(state, action, set),
    initialState,
  );

  const [showReview, setShowReview] = useState(false);

  const currentTask = set.tasks[state.currentIndex];
  if (!currentTask) return <p>Заданий нет.</p>;

  const currentAnswer = state.answers.find((a) => a.taskId === currentTask.id);
  const progress = getProgress(set, state.answers);

  function handleFinish() {
    const missed = getMissedTasks(set, state);
    let message = "Все задания заполнены. Завершить попытку?";

    if (missed.length > 0) {
      const missedNumbers = missed
        .map((task) => set.tasks.indexOf(task) + 1)
        .join(", ");
      message = `Не заполнены задания: ${missedNumbers}. Всё равно завершить?`;
    }

    if (!window.confirm(message)) return;
    dispatch({ type: "finish" });
  }

  return (
    <section>
      <h1>{set.title}</h1>
      <p>
        Задание {state.currentIndex + 1} из {set.tasks.length}
      </p>
      <p>
        Заполнено {progress.filled} из {progress.total}
      </p>

      {state.status === "submitted" ? (
        <>
          <p>Попытка завершена.</p>
          <ReviewList set={set} answers={state.answers} />
          <button type="button" onClick={() => dispatch({ type: "restart" })}>
            Начать новую попытку
          </button>
        </>
      ) : showReview ? (
        <>
          <ReviewList
            set={set}
            answers={state.answers}
            onClear={(taskId) => dispatch({ type: "clear", taskId })}
            canEdit={true}
          />
          <button type="button" onClick={() => setShowReview(false)}>
            Вернуться к заданию
          </button>
        </>
      ) : (
        <>
          <TaskCardForm
            task={currentTask}
            answer={currentAnswer}
            onChange={(answer) => dispatch({ type: "answer", answer })}
            onClear={(taskId) => dispatch({ type: "clear", taskId })}
          />
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "go", index: state.currentIndex - 1 })
              }
              disabled={state.currentIndex === 0}
            >
              Назад
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "go", index: state.currentIndex + 1 })
              }
              disabled={state.currentIndex === set.tasks.length - 1}
            >
              Далее
            </button>
            <button type="button" onClick={handleFinish}>
              Завершить
            </button>
            <button type="button" onClick={() => setShowReview(true)}>
              Посмотреть обзор
            </button>
          </div>
        </>
      )}
    </section>
  );
}