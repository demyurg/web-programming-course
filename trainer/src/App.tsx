// src/App.tsx
import { useReducer, useMemo } from 'react';
import { mainSet } from './demo.js';
import { getUnansweredTaskIds } from './domain.js';
import { attemptReducer, type AttemptState, type AttemptAction } from './attemptRules.js';
import { TaskList } from './components/TaskList.js';
import { TaskCard } from './components/TaskCard.js';
import { AnswerInput } from './components/AnswerInput.js';
import { AttemptReview } from './components/AttemptReview.js';

const initialState: AttemptState = {
  status: 'draft',
  answers: [],
  selectedTaskId: mainSet.tasks.length > 0 ? mainSet.tasks[0].id : undefined,
  viewMode: 'task',
};

export function App() {
  const [state, dispatch] = useReducer(attemptReducer, initialState);


  const currentTask = mainSet.tasks.find((t) => t.id === state.selectedTaskId);
  const unansweredIds = getUnansweredTaskIds(mainSet.tasks, state.answers);
  const progress = mainSet.tasks.length - unansweredIds.length;
  const canEdit = state.status === 'draft';

 
  const handleSetAnswer = (answer: any) => dispatch({ type: 'SET_ANSWER', answer });
  const handleClearAnswer = (taskId: string) => dispatch({ type: 'CLEAR_ANSWER', taskId });
  const handleSubmit = () => {
    if (unansweredIds.length > 0) {
      if (!window.confirm(`Осталось незаполненных заданий: ${unansweredIds.length}. Завершить?`)) return;
    }
    dispatch({ type: 'SUBMIT' });
  };


  if (state.status === 'submitted') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h2>Попытка завершена!</h2>
        <p>Прогресс: {progress} из {mainSet.tasks.length}</p>
        <AttemptReview 
          tasks={mainSet.tasks}
          answers={state.answers}
          canEdit={false} 
          onClear={handleClearAnswer}
          onBackToTask={(id) => dispatch({ type: 'SELECT_TASK', taskId: id })}
        />
        <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px' }}>
          Начать новую попытку (перезагрузка)
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>{mainSet.title}</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Прогресс: {progress} из {mainSet.tasks.length}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'task' })}
            style={{ fontWeight: state.viewMode === 'task' ? 'bold' : 'normal' }}
          >
            Задание
          </button>
          <button 
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'review' })}
            style={{ fontWeight: state.viewMode === 'review' ? 'bold' : 'normal' }}
          >
            Обзор ({state.answers.length}/{mainSet.tasks.length})
          </button>
        </div>
      </header>

      <main>
        {state.viewMode === 'task' ? (
          <>
            <TaskList 
              tasks={mainSet.tasks} 
              selectedId={state.selectedTaskId} 
              onSelect={(id) => dispatch({ type: 'SELECT_TASK', taskId: id })}
              unansweredIds={unansweredIds}
            />
            {currentTask && (
              <div style={{ marginTop: '20px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <TaskCard task={currentTask} />
                <AnswerInput
                  task={currentTask}
                  currentAnswer={state.answers.find((a) => a.taskId === currentTask.id)}
                  canEdit={canEdit}
                  onChange={handleSetAnswer}
                  onClear={() => handleClearAnswer(currentTask.id)}
                />
              </div>
            )}
          </>
        ) : (
          <AttemptReview 
            tasks={mainSet.tasks}
            answers={state.answers}
            canEdit={canEdit}
            onClear={handleClearAnswer}
            onBackToTask={(id) => dispatch({ type: 'SELECT_TASK', taskId: id })}
          />
        )}

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            disabled={mainSet.tasks[0].id === state.selectedTaskId}
            onClick={() => {
              const idx = mainSet.tasks.findIndex((t) => t.id === state.selectedTaskId);
              if (idx > 0) dispatch({ type: 'SELECT_TASK', taskId: mainSet.tasks[idx - 1].id });
            }}
            style={{ 
              padding: '8px 16px', 
              cursor: mainSet.tasks[0].id === state.selectedTaskId ? 'not-allowed' : 'pointer',
              opacity: mainSet.tasks[0].id === state.selectedTaskId ? 0.5 : 1
            }}
          >
            Назад
          </button>
          <button 
            disabled={mainSet.tasks[mainSet.tasks.length - 1].id === state.selectedTaskId}
            onClick={() => {
              const idx = mainSet.tasks.findIndex((t) => t.id === state.selectedTaskId);
              if (idx < mainSet.tasks.length - 1) dispatch({ type: 'SELECT_TASK', taskId: mainSet.tasks[idx + 1].id });
            }}
            style={{ 
              padding: '8px 16px', 
              cursor: mainSet.tasks[mainSet.tasks.length - 1].id === state.selectedTaskId ? 'not-allowed' : 'pointer',
              opacity: mainSet.tasks[mainSet.tasks.length - 1].id === state.selectedTaskId ? 0.5 : 1
            }}
          >
            Вперёд →
          </button>
          <button 
            onClick={handleSubmit} 
            style={{ 
              marginLeft: 'auto', 
              padding: '10px 20px', 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Завершить попытку
          </button>
        </div>
      </main>
    </div>
  );
}