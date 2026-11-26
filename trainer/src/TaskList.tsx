import type { Task } from "./domain";
import { TaskListItem } from "./TaskListItem";

type TaskListProps = {
  tasks: Task[];
  onSelect: (id: string) => void;
};

// key - атрибут React, необходимый для правильного сопоставления элементов списка при перерисовке (в случае изменения контента в списке)
export function TaskList({ tasks, onSelect }: TaskListProps) {
  return (
    <ul>
      {tasks.map((task) => (
        <TaskListItem key={task.id} task={task} onSelect={onSelect} />
      ))}
    </ul>
  );
}