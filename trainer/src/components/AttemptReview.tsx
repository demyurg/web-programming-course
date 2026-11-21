import { Task, Answer } from '../domain.js';

type AttemptReviewProps = {
  tasks: Task[];
  answers: Answer[];
  canEdit: boolean;
  onClear: (taskId: string) => void;
  onBackToTask: (taskId: string) => void;
};

export function AttemptReview({
  tasks,
  answers,
  canEdit,
  onClear,
  onBackToTask,
}: AttemptReviewProps) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Обзор всех ответов</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map((task) => {
          const ans = answers.find((a) => a.taskId === task.id);
          const isAnswered = !!ans;

          return (
            <li
              key={task.id}
              style={{
                marginBottom: '12px',
                padding: '12px',
                border: '1px solid #eee',
                borderRadius: '4px',
                background: '#fafafa',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >

                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>
                    {task.id} ({task.topic})
                  </strong>
                  <div
                    style={{
                      color: isAnswered ? '#28a745' : '#dc3545',
                      fontStyle: isAnswered ? 'normal' : 'italic',
                    }}
                  >
                    {isAnswered
                      ? ans.kind === 'single-choice'
                        ? `Выбран вариант: ${ans.optionId}`
                        : ans.text
                      : 'Нет ответа (пропущено)'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  
                  {canEdit && isAnswered && (
                    <button
                      type="button"
                      onClick={() => onClear(task.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#ffc107',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      Очистить ответ
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => onBackToTask(task.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    К заданию
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}