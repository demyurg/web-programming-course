import { Task } from '../domain.js';

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>{task.topic}</h3>
      <p><strong>Вопрос:</strong> {task.prompt}</p>
      
      {/* Сужение типа (Narrowing) по полю kind */}
      {task.kind === 'single-choice' ? (
        <div>
          <p><strong>Варианты:</strong></p>
          <ul>
            {task.options.map((opt) => (
              <li key={opt.id}>{opt.label}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p><em>Это задание с коротким текстовым ответом.</em></p>
      )}

      {/* Безопасный вывод code (React сам экранирует его, исполнения не будет) */}
      {task.code && (
        <pre style={{ background: '#f4f4f4', padding: '12px', borderRadius: '4px', overflowX: 'auto' }}>
          {task.code}
        </pre>
      )}
    </div>
  );
}