import { Task, Answer, isAnswerFilled } from "../domain";

type TaskListProps = {
  tasks: readonly Task[];
  activeId: string | null;
  answers: readonly Answer[];
  onSelect: (id: string) => void;
};


export function TaskList({ tasks, activeId, answers, onSelect }: TaskListProps) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {tasks.map((task) => {
        const isCurrent = task.id === activeId;
        const answer = answers.find(a => a.taskId === task.id);
        const isFilled = isAnswerFilled(answer);

        return (
          <button
            key={task.id}
            onClick={() => onSelect(task.id)}
            type="button"
            style={{
              padding: "0.5rem 1rem",
              textAlign: "left",
              cursor: "pointer",
              backgroundColor: isCurrent ? "#e0e0e0" : "#fff",
              border: "1px solid #aaa",
              borderRadius: "4px",
              fontWeight: isCurrent ? "bold" : "normal",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >

            <span>{task.topic}</span>


            {isFilled && <span style={{ color: "green", fontSize: "0.9rem" }}>+</span>}
          </button>
        );
      })}
    </nav>
  );
}
