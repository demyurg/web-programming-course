import { useState } from 'react';
import { mainSet } from './demo';
import { type Answer, updateAnswer, getUnansweredTaskIds } from './domain';
import { TaskList } from './components/TaskList';
import { TaskCard } from './components/TaskCard';
import { AnswerInput } from './components/AnswerInput';

export function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(
    mainSet.tasks.length > 0 ? mainSet.tasks[0].id : undefined
  );
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentTask = mainSet.tasks.find((t) => t.id === selectedTaskId);

  // ВАЖНО: Вычисляем unansweredIds
  const unansweredIds = getUnansweredTaskIds(mainSet.tasks, answers);
  const progress = mainSet.tasks.length - unansweredIds.length;

  const handleAnswerChange = (newAnswer: Answer) => {
    setAnswers((prev) => updateAnswer(prev, newAnswer));
  };

  const handleFinish = () => {
    if (unansweredIds.length > 0) {
      const confirmed = window.confirm(`Осталось незаполненных заданий: ${unansweredIds.length}. Завершить попытку?`);
      if (!confirmed) return;
    }
    setIsFinished(true);
  };

  const startNewAttempt = () => {
    setAnswers([]);
    setIsFinished(false);
    setSelectedTaskId(mainSet.tasks.length > 0 ? mainSet.tasks[0].id : undefined);
  };

  if (mainSet.tasks.length === 0 || !currentTask) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <h2>{mainSet.title}</h2>
        <p>Задания отсутствуют или выбраны некорректно.</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '35px', fontFamily: 'sans-serif', border: '2px solid #d3d3d3', borderRadius: '10px' }}>
        <h2>Попытка завершена!</h2>
        <p>Ваш прогресс: {progress} из {mainSet.tasks.length} заданий.</p>
        
        <h3>Обзор ваших ответов:</h3>
        <ul style={{ lineHeight: '1.6' }}>
          {mainSet.tasks.map((task) => {
            const ans = answers.find((a) => a.taskId === task.id);
            const ansText = ans 
              ? (ans.kind === 'single-choice' ? `Выбран вариант: ${ans.optionId}` : ans.text) 
              : 'Нет ответа (пропущено)';
            
            return (
              <li key={task.id}>
                <strong>{task.id} ({task.topic}):</strong> {ansText}
              </li>
            );
          })}
        </ul>

        <button 
          onClick={startNewAttempt} 
          style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Начать новую попытку
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '35px', fontFamily: 'sans-serif', border: '2px solid #d3d3d3', borderRadius: '10px' }}>
      <header style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>{mainSet.title}</h1>
        <p style={{ margin: '5px 0 0', color: '#666' }}>
          Прогресс: {progress} из {mainSet.tasks.length} | Незаполнено: {unansweredIds.length}
        </p>
      </header>

      <main>
        <h2>Список заданий</h2>
        <TaskList 
          tasks={mainSet.tasks} 
          selectedId={selectedTaskId} 
          onSelect={setSelectedTaskId}
          unansweredIds={unansweredIds}  
        />

        <h2>Текущее задание</h2>
        <TaskCard task={currentTask} />
        <AnswerInput
          task={currentTask}
          currentAnswer={answers.find((a) => a.taskId === currentTask.id)}
          isFinished={isFinished}
          onChange={handleAnswerChange}
        />
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            disabled={mainSet.tasks[0].id === selectedTaskId}
            onClick={() => {
              const idx = mainSet.tasks.findIndex((t) => t.id === selectedTaskId);
              if (idx > 0) setSelectedTaskId(mainSet.tasks[idx - 1].id);
            }}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Назад
          </button>
          
          <button 
            disabled={mainSet.tasks[mainSet.tasks.length - 1].id === selectedTaskId}
            onClick={() => {
              const idx = mainSet.tasks.findIndex((t) => t.id === selectedTaskId);
              if (idx < mainSet.tasks.length - 1) setSelectedTaskId(mainSet.tasks[idx + 1].id);
            }}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Вперёд
          </button>

          <button 
            onClick={handleFinish} 
            style={{ marginLeft: 'auto', padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Завершить попытку
          </button>
        </div>
      </main>
    </div>
  );
}