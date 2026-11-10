import { Task } from '../domain';

type TaskListProps = {
  tasks: Task[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  unansweredIds: string[];
};

export function TaskList({ tasks, selectedId, onSelect, unansweredIds }: TaskListProps) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map((task) => {
        const isUnanswered = unansweredIds.includes(task.id);
        return (
          <li key={task.id} style={{ marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => onSelect(task.id)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: selectedId === task.id ? 'bold' : 'normal',
                border: selectedId === task.id ? '2px solid #007bff' : '1px solid #ccc',
                borderLeft: isUnanswered ? '4px solid red' : '4px solid green',
                borderRadius: '4px',
                background: selectedId === task.id ? '#e7f1ff' : 'white',
                width: '100%',
                textAlign: 'left',
              }}
            >
              {task.topic}: {task.id} {isUnanswered ? '(не заполнено)' : '✓'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}