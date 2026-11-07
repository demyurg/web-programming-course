import { Task, Answer } from '../domain.js';

type AnswerInputProps = {
  task: Task;
  currentAnswer: Answer | undefined;
  isFinished: boolean;
  onChange: (answer: Answer) => void;
};

export function AnswerInput({ task, currentAnswer, isFinished, onChange }: AnswerInputProps) {
  // Вариант single-choice: радио-кнопки
  if (task.kind === 'single-choice') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Выберите вариант:</p>
        {task.options.map((opt) => {
          const isChecked =
            currentAnswer?.kind === 'single-choice' && currentAnswer.optionId === opt.id;
          return (
            <label
              key={opt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isFinished ? 'default' : 'pointer',
                padding: '6px 10px',
                border: isChecked ? '1px solid #007bff' : '1px solid transparent',
                borderRadius: '4px',
                background: isChecked ? '#e7f1ff' : 'transparent',
              }}
            >
              <input
                type="radio"
                name={`task-${task.id}`}
                value={opt.id}
                checked={isChecked}
                disabled={isFinished}
                onChange={() =>
                  onChange({ taskId: task.id, kind: 'single-choice', optionId: opt.id })
                }
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    );
  }

  // Вариант short-text: textarea
  const textValue = currentAnswer?.kind === 'short-text' ? currentAnswer.text : '';

  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Ваш ответ:</p>
      <textarea
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '8px',
          fontFamily: 'inherit',
          fontSize: '14px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          resize: 'vertical',
        }}
        value={textValue}
        disabled={isFinished}
        placeholder="Введите ваш ответ..."
        onChange={(e) =>
          onChange({ taskId: task.id, kind: 'short-text', text: e.target.value })
        }
      />
    </div>
  );
}