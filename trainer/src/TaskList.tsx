import React from "react";
import { Task, Answer, Action } from "./types";
import { TaskCard } from "./TaskCard";

type TaskListProps = {
  task: Task;
  answer?: Answer;
  dispatch: React.Dispatch<Action>;
  isSubmitted: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
};

export function TaskList({
  task,
  answer,
  dispatch,
  isSubmitted,
  onPrev,
  onNext,
  onFinish,
  canGoPrev,
  canGoNext,
}: TaskListProps) {
  return (
    <div>
      <TaskCard
        task={task}
        answer={answer}
        dispatch={dispatch}
        isSubmitted={isSubmitted}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button type="button" onClick={onPrev} disabled={!canGoPrev || isSubmitted}>
          ← Назад
        </button>
        <button type="button" onClick={onNext} disabled={!canGoNext || isSubmitted}>
          Вперёд →
        </button>
        {!isSubmitted && !canGoNext && (
          <button type="button" onClick={onFinish}>
            Завершить
          </button>
        )}
      </div>
    </div>
  );
}