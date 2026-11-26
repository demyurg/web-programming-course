import type { Task, Answer } from "../domain";
import { isAnswered } from "../domain";
import { TaskListItem } from "./TaskListItem";

type TaskListProps = {
  tasks: Task[];
  answers: Answer[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

export function TaskList({ tasks, answers, currentIndex, onSelect }: TaskListProps) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {tasks.map((task, index) => {
        const answer = answers.find((a) => a.taskId === task.id);
        
        return (
          <TaskListItem 
            key={task.id} 
            task={task} 
            onSelect={() => onSelect(index)} // Передаем индекс вместо id, так проще навигация
            isSelected={index === currentIndex}
            isAnswered={isAnswered(task, answer)}
          />
        );
      })}
    </ul>
  );
}