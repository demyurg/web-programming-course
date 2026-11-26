import type { Task } from "./domain";

type TaskListProps = {
    tasks: Task[];
    currentId: string;
    unansweredIds: Set<string>;
    onSelect: (id: string) => void;
};

export function TaskList({ tasks, currentId, unansweredIds, onSelect }: TaskListProps) {
    return (
        <section aria-label="Список заданий">
            <h2>Задания</h2>
            <ul>
                {tasks.map((task, index) => (
                    <li key={task.id}>
                        <button
                            type="button"
                            aria-current={currentId === task.id ? "step" : undefined}
                            onClick={() => onSelect(task.id)}
                        >
                            {index + 1}. {task.prompt} — {unansweredIds.has(task.id) ? "нет ответа" : "отвечено"}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
