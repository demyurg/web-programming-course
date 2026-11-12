import { useReducer, useEffect, useMemo, useState } from "react";
import type { Task, TrainingSet, Answer, Draft } from "./domain.js";
import { countProgress } from "./domain.js";
import { trainingSet } from "./demo.js";
import { reducer, createInitialState } from "./reducer.js";
import { getStorageKey, readDraft, writeDraft, clearDraft } from "./storage.js";

// --- Утилиты ---
function isAnswered(answer: Answer | undefined): boolean {
  if (!answer) return false;
  return answer.kind === "single-choice"
    ? answer.optionId.length > 0
    : answer.text.trim().length > 0;
}

// --- Заголовок модуля с прогрессом ---
type ModuleHeaderProps = {
  title: string;
  answered: number;
  total: number;
  isSubmitted: boolean;
  isReviewOpen: boolean;
  onToggleReview: () => void;
};

export function ModuleHeader({
  title,
  answered,
  total,
  isSubmitted,
  isReviewOpen,
  onToggleReview,
}: ModuleHeaderProps) {
  return (
    <header className="module-header">
      <div className="module-header-info">
        <h1 className="module-title">{title}</h1>
        <p className="module-count">
          Заполнено: {answered} из {total}
        </p>
      </div>
      {!isSubmitted && total > 0 && (
        <button
          type="button"
          className="nav-button"
          onClick={onToggleReview}
        >
          {isReviewOpen ? "← Вернуться к заданиям" : "Обзор ответов"}
        </button>
      )}
    </header>
  );
}
// --- Список заданий с прогрессом ---
type TaskListProps = {
  tasks: readonly Task[];
  currentIndex: number;
  answers: readonly Answer[];
  onSelect: (index: number) => void;
  disabled: boolean;
};

export function TaskList({
  tasks,
  currentIndex,
  answers,
  onSelect,
  disabled,
}: TaskListProps) {
  return (
    <nav aria-label="Список заданий">
      <ul className="task-list">
        {tasks.map((task, index) => {
          const answer = answers.find((a) => a.taskId === task.id);
          const filled = isAnswered(answer);
          const isCurrent = index === currentIndex;
          return (
            <li key={task.id}>
              <button
                type="button"
                className={
                  "task-list-item" +
                  (isCurrent ? " is-current" : "") +
                  (filled ? " is-filled" : "")
                }
                onClick={() => onSelect(index)}
                disabled={disabled}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className="task-list-number">{index + 1}</span>
                <span className="task-list-question">{task.question}</span>
                <span className="task-list-status">
                  {filled ? "✓" : "○"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// --- Форма задания (controlled) ---
type TaskFormProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
  disabled: boolean;
};

export function TaskForm({ task, answer, onChange, disabled }: TaskFormProps) {
  if (task.kind === "single-choice") {
    return (
      <fieldset className="task-form" disabled={disabled}>
        <legend className="task-form-legend">Выберите один вариант:</legend>
        <ul className="task-form-options">
          {task.options.map((option) => {
            const isChecked =
              answer?.kind === "single-choice" &&
              answer.optionId === option.id;
            return (
              <li key={option.id} className="task-form-option">
                <label className="task-form-label">
                  <input
                    type="radio"
                    name={task.id}
                    value={option.id}
                    checked={isChecked}
                    onChange={() =>
                      onChange({
                        taskId: task.id,
                        kind: "single-choice",
                        optionId: option.id,
                      })
                    }
                  />
                  <span className="task-form-option-text">
                    {option.text}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    );
  }

  return (
    <div className="task-form">
      <label className="task-form-label" htmlFor={`text-${task.id}`}>
        Введите короткий ответ:
        <textarea
          id={`text-${task.id}`}
          className="task-form-textarea"
          value={answer?.kind === "short-text" ? answer.text : ""}
          onChange={(event) =>
            onChange({
              taskId: task.id,
              kind: "short-text",
              text: event.target.value,
            })
          }
          disabled={disabled}
          rows={4}
        />
      </label>
    </div>
  );
}

// --- Карточка задания ---
type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
  onClear: (taskId: string) => void;
  disabled: boolean;
};

export function TaskCard({
  task,
  answer,
  onChange,
  onClear,
  disabled,
}: TaskCardProps) {
  const hasAnswer = answer !== undefined;

  return (
    <article className="task-card">
      <header className="task-card-header">
        <span className="task-card-topic">{task.topic}</span>
        <span className="task-card-kind">{task.kind}</span>
      </header>

      <h2 className="task-card-question">{task.question}</h2>

      {task.code !== undefined && (
        <pre className="task-card-code">
          <code>{task.code}</code>
        </pre>
      )}

      <TaskForm
        task={task}
        answer={answer}
        onChange={onChange}
        disabled={disabled}
      />

      {!disabled && hasAnswer && (
        <div className="task-card-actions">
          <button
            type="button"
            className="clear-button"
            onClick={() => onClear(task.id)}
          >
            Очистить ответ
          </button>
        </div>
      )}
    </article>
  );
}
// --- Навигация ---
type NavigationProps = {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  disabled: boolean;
};

export function Navigation({
  currentIndex,
  total,
  onPrev,
  onNext,
  onFinish,
  disabled,
}: NavigationProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <nav className="navigation" aria-label="Навигация по заданиям">
      <button
        type="button"
        className="nav-button"
        onClick={onPrev}
        disabled={isFirst || disabled}
      >
        ← Назад
      </button>
      <span className="nav-counter">
        {currentIndex + 1} / {total}
      </span>
      {isLast ? (
        <button
          type="button"
          className="nav-button nav-button-finish"
          onClick={onFinish}
          disabled={disabled}
        >
          Завершить
        </button>
      ) : (
        <button
          type="button"
          className="nav-button"
          onClick={onNext}
          disabled={disabled}
        >
          Далее →
        </button>
      )}
    </nav>
  );
}

// --- Предупреждение о пропущенных заданиях ---
type WarningModalProps = {
  unanswered: readonly Task[];
  onConfirm: () => void;
  onCancel: () => void;
};

export function WarningModal({
  unanswered,
  onConfirm,
  onCancel,
}: WarningModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal-title">Есть незаполненные задания</h2>
        <p className="modal-text">
          Вы не ответили на {unanswered.length}{" "}
          {unanswered.length === 1
            ? "задание"
            : unanswered.length < 5
              ? "задания"
              : "заданий"}
          :
        </p>
        <ul className="modal-list">
          {unanswered.map((task, index) => (
            <li key={task.id}>
              {index + 1}. {task.question}
            </li>
          ))}
        </ul>
        <p className="modal-text">
          Всё равно завершить попытку?
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="modal-button modal-button-cancel"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className="modal-button modal-button-confirm"
            onClick={onConfirm}
          >
            Завершить
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Обзор ответов ---
type ReviewProps = {
  tasks: readonly Task[];
  answers: readonly Answer[];
  isSubmitted: boolean;
  onClear: (taskId: string) => void;
  onBackToTasks: () => void;
  onFinish: () => void;
  onRestart: () => void;
};

export function Review({
  tasks,
  answers,
  isSubmitted,
  onClear,
  onBackToTasks,
  onFinish,
  onRestart,
}: ReviewProps) {
  return (
    <div className="review">
      <h2 className="review-title">
        {isSubmitted ? "Итоги попытки" : "Обзор ответов"}
      </h2>
      <ul className="review-list">
        {tasks.map((task, index) => {
          const answer = answers.find((a) => a.taskId === task.id);
          const filled = isAnswered(answer);
          const hasAnswer = answer !== undefined;

          return (
            <li key={task.id} className="review-item">
              <div className="review-item-header">
                <span className="review-item-number">{index + 1}.</span>
                <span className="review-item-topic">{task.topic}</span>
                <span
                  className={
                    "review-item-status" +
                    (filled ? " is-filled" : " is-empty")
                  }
                >
                  {filled ? "Заполнено" : "Пропущено"}
                </span>
              </div>
              <p className="review-item-question">{task.question}</p>
              {task.code !== undefined && (
                <pre className="review-item-code">
                  <code>{task.code}</code>
                </pre>
              )}
              <div className="review-item-answer-row">
                <div className="review-item-answer">
                  {answer?.kind === "single-choice" && task.kind === "single-choice" ? (
                    <span>
                      Вариант:{" "}
                      {task.options.find((o) => o.id === answer.optionId)
                        ?.text ?? "—"}
                    </span>
                  ) : answer?.kind === "short-text" ? (
                    <span>
                      Ответ:{" "}
                      {answer.text.trim().length > 0 ? answer.text : "—"}
                    </span>
                  ) : (
                    <span className="review-item-empty">Нет ответа</span>
                  )}
                </div>
                {!isSubmitted && hasAnswer && (
                  <button
                    type="button"
                    className="clear-button"
                    onClick={() => onClear(task.id)}
                  >
                    Очистить
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="review-actions">
        {isSubmitted ? (
          <button
            type="button"
            className="review-restart"
            onClick={onRestart}
          >
            Начать новую попытку
          </button>
        ) : (
          <>
            <button
              type="button"
              className="nav-button"
              onClick={onBackToTasks}
            >
              ← Вернуться к заданиям
            </button>
            <button
              type="button"
              className="nav-button nav-button-finish"
              onClick={onFinish}
            >
              Завершить попытку
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// --- Сообщения об ошибках ---
type ErrorBannerProps = {
  message: string;
  onDismiss?: () => void;
  onReset?: () => void;
};

export function ErrorBanner({ message, onDismiss, onReset }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <p>{message}</p>
      <div className="error-banner-actions">
        {onReset && (
          <button type="button" className="error-button" onClick={onReset}>
            Сбросить черновик
          </button>
        )}
        {onDismiss && (
          <button type="button" className="error-button" onClick={onDismiss}>
            Закрыть
          </button>
        )}
      </div>
    </div>
  );
}

// --- Пустое состояние ---
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state" role="status">
      <p>{message}</p>
    </div>
  );
}
// --- Корневой компонент ---
export function App() {
  const trainingModule: TrainingSet = trainingSet;
  const tasks = trainingModule.tasks;

  const [state, dispatch] = useReducer(reducer, tasks, createInitialState);
  const [showWarning, setShowWarning] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Эффект чтения черновика при монтировании
  useEffect(() => {
    try {
      const key = getStorageKey(trainingModule.id);
      const raw = localStorage.getItem(key);
      const draft = readDraft(raw, trainingModule.id);
      if (draft) {
        dispatch({ type: "restored", draft, tasks });
      } else if (raw !== null) {
        dispatch({ type: "draftCorrupted" });
      }
    } catch {
      dispatch({
        type: "storageFailed",
        message: "Не удалось прочитать черновик. Ввод продолжается в памяти.",
      });
    }
  }, [trainingModule.id, tasks]);

  // Эффект записи черновика при изменении состояния
  useEffect(() => {
    if (state.status === "in-progress") {
      const currentTask = tasks[state.currentIndex];
      const draft: Draft = {
        version: 1,
        setId: trainingModule.id,
        taskId: currentTask?.id ?? "",
        answers: state.answers,
        status: "in-progress",
      };
      try {
        const key = getStorageKey(trainingModule.id);
        writeDraft(key, draft);
      } catch {
        dispatch({
          type: "storageFailed",
          message: "Не удалось сохранить черновик. Ввод продолжается в памяти.",
        });
      }
    }
  }, [state.answers, state.currentIndex, state.status, trainingModule.id, tasks]);

  const isSubmitted = state.status === "submitted";

  const currentTask =
    !isSubmitted && tasks.length > 0
      ? tasks[state.currentIndex]
      : undefined;

  const currentAnswer =
    currentTask !== undefined
      ? state.answers.find((a) => a.taskId === currentTask.id)
      : undefined;

  const { filled: answeredCount } = useMemo(
    () => countProgress(tasks, state.answers),
    [tasks, state.answers],
  );

  const unansweredTasks = useMemo(
    () => tasks.filter((task) => !isAnswered(state.answers.find((a) => a.taskId === task.id))),
    [tasks, state.answers],
  );

  const handleAnswerChange = (answer: Answer) => {
    dispatch({ type: "answerChanged", answer });
  };

  const handleClearAnswer = (taskId: string) => {
    dispatch({ type: "answerCleared", taskId });
  };

  const handleSelect = (index: number) => {
    if (!isSubmitted) {
      dispatch({ type: "moved", index });
    }
  };

  const handlePrev = () => {
    dispatch({ type: "moved", index: Math.max(state.currentIndex - 1, 0) });
  };

  const handleNext = () => {
    dispatch({
      type: "moved",
      index: Math.min(state.currentIndex + 1, tasks.length - 1),
    });
  };

  const finishAttempt = () => {
    setIsReviewOpen(false);
    dispatch({ type: "submitted" });
    try {
      clearDraft(getStorageKey(trainingModule.id));
    } catch {
      // игнорируем
    }
  };

  const handleFinish = () => {
    if (unansweredTasks.length > 0) {
      setShowWarning(true);
    } else {
      finishAttempt();
    }
  };

  const handleConfirmFinish = () => {
    setShowWarning(false);
    finishAttempt();
  };

  const handleCancelFinish = () => {
    setShowWarning(false);
  };

  const handleRestart = () => {
    setIsReviewOpen(false);
    dispatch({ type: "reset" });
    try {
      clearDraft(getStorageKey(trainingModule.id));
    } catch {
      // игнорируем
    }
  };

  const handleResetDraft = () => {
    setIsReviewOpen(false);
    dispatch({ type: "reset" });
    try {
      clearDraft(getStorageKey(trainingModule.id));
    } catch {
      // игнорируем
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="app">
        <ModuleHeader
          title={trainingModule.title}
          answered={0}
          total={0}
          isSubmitted={isSubmitted}
          isReviewOpen={false}
          onToggleReview={() => {}}
        />
        <EmptyState message="В этом модуле пока нет заданий." />
      </div>
    );
  }

  return (
    <div className="app">
      <ModuleHeader
        title={trainingModule.title}
        answered={answeredCount}
        total={tasks.length}
        isSubmitted={isSubmitted}
        isReviewOpen={isReviewOpen}
        onToggleReview={() => setIsReviewOpen((prev) => !prev)}
      />

      {state.storageError && (
        <ErrorBanner message={state.storageError} />
      )}

      {state.draftError && (
        <ErrorBanner
          message={state.draftError}
          onReset={handleResetDraft}
        />
      )}

      {isSubmitted || isReviewOpen ? (
        <Review
          tasks={tasks}
          answers={state.answers}
          isSubmitted={isSubmitted}
          onClear={handleClearAnswer}
          onBackToTasks={() => setIsReviewOpen(false)}
          onFinish={handleFinish}
          onRestart={handleRestart}
        />
      ) : (
        <div className="app-layout">
          <TaskList
            tasks={tasks}
            currentIndex={state.currentIndex}
            answers={state.answers}
            onSelect={handleSelect}
            disabled={false}
          />
          <div className="app-main">
            {currentTask !== undefined ? (
              <TaskCard
                task={currentTask}
                answer={currentAnswer}
                onChange={handleAnswerChange}
                onClear={handleClearAnswer}
                disabled={false}
              />
            ) : (
              <EmptyState message="Задание не найдено." />
            )}
            <Navigation
              currentIndex={state.currentIndex}
              total={tasks.length}
              onPrev={handlePrev}
              onNext={handleNext}
              onFinish={handleFinish}
              disabled={false}
            />
          </div>
        </div>
      )}

      {showWarning && (
        <WarningModal
          unanswered={unansweredTasks}
          onConfirm={handleConfirmFinish}
          onCancel={handleCancelFinish}
        />
      )}
    </div>
  );
}
