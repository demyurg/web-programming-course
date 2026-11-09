import type { Task, Answer } from "./domain";
import { TaskCard } from "./TaskCard";

type TaskListProps = {
  task: Task;
  answer: Answer | undefined;
  onAnswerChange: (answer: Answer) => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
};

export function TaskList({
  task,
  answer,
  onAnswerChange,
  onPrev,
  onNext,
  onFinish,
  canGoPrev,
  canGoNext,
}: TaskListProps) {
  return (
    <div>
      <TaskCard task={task} answer={answer} onChange={onAnswerChange} />
      
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button type="button" onClick={onPrev} disabled={!canGoPrev}>
          ← Назад
        </button>
        
        {canGoNext ? (
          <button type="button" onClick={onNext}>
            Далее →
          </button>
        ) : (
          <button type="button" onClick={onFinish} style={{ fontWeight: "bold" }}>
            Завершить
          </button>
        )}
      </div>
    </div>
  );
}