import type { Task } from "./domain";

type TaskListProps = {
    tasks: Task[];
    onSelect: (id: string) => void;
};

export function TaskList({ tasks, onSelect }: TaskListProps) {
    return (
        <section aria-label="Список заданий">
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        <button type="button" onClick={() => onSelect(task.id)}>
                            {task.prompt}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
