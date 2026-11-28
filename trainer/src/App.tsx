import { useReducer, useEffect, useState } from 'react';
import { getUnansweredTaskIds } from './domain.js';
import { attemptReducer, type AttemptState } from './attemptRules.js';
import { trainerApi, type AnswerPayload } from './api/trainerApi.js';
import { TaskList } from './components/TaskList.js';
import { TaskCard } from './components/TaskCard.js';
import { AnswerInput } from './components/AnswerInput.js';
import { AttemptReview } from './components/AttemptReview.js';

const initialState: AttemptState = {
  status: 'draft',
  answers: [],
  selectedTaskId: undefined,
  viewMode: 'task',
};

export function App() {
  const [state, dispatch] = useReducer(attemptReducer, initialState);

  
  const [attemptId, setAttemptId] = useState<string | null>(
    sessionStorage.getItem('attemptId')
  );
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainingSet, setTrainingSet] = useState<any>(null);

 
  const currentTask = trainingSet?.tasks.find((t: any) => t.id === state.selectedTaskId);
  const unansweredIds = trainingSet ? getUnansweredTaskIds(trainingSet.tasks, state.answers) : [];
  const progress = trainingSet ? trainingSet.tasks.length - unansweredIds.length : 0;
  const canEdit = state.status === 'draft';

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setApiError(null);
      try {
        if (attemptId) {
          const attempt = await trainerApi.getAttempt(attemptId);
          setTrainingSet(attempt.trainingSet);
          dispatch({ type: 'SYNC_FROM_SERVER', attempt });
        } else {
     
          const sets = await trainerApi.getSets();
          if (sets.length === 0) {
            throw new Error('Нет доступных модулей на сервере');
          }
          const setId = sets[0].id;
          const newAttempt = await trainerApi.createAttempt(setId);
          setAttemptId(newAttempt.attemptId);
          sessionStorage.setItem('attemptId', newAttempt.attemptId);
          setTrainingSet(newAttempt.trainingSet);
          dispatch({ type: 'SYNC_FROM_SERVER', attempt: newAttempt });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ошибка сети';
        setApiError(message);
        
        if (attemptId) {
          sessionStorage.removeItem('attemptId');
          setAttemptId(null);
        }
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [attemptId]);

  const handleSetAnswer = async (answer: AnswerPayload) => {
    if (!attemptId) return;
    setApiError(null);
    try {
      await trainerApi.saveAnswer(attemptId, answer.taskId, answer);
      dispatch({ type: 'SET_ANSWER', answer });
    } catch (err) {
      setApiError('Не удалось сохранить ответ. Проверьте соединение.');
    }
  };

  const handleClearAnswer = async (taskId: string) => {
    if (!attemptId) return;
    setApiError(null);
    try {
      await trainerApi.deleteAnswer(attemptId, taskId);
      dispatch({ type: 'CLEAR_ANSWER', taskId });
    } catch (err) {
      setApiError('Не удалось удалить ответ. Проверьте соединение.');
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    if (unansweredIds.length > 0) {
      if (!window.confirm(`Осталось незаполненных заданий: ${unansweredIds.length}. Завершить?`)) return;
    }
    setIsSubmitting(true);
    setApiError(null);
    try {
      const result = await trainerApi.submitAttempt(attemptId);
      dispatch({ type: 'SUBMIT' });
    } catch (err) {
      setApiError('Не удалось завершить попытку. Проверьте соединение.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }


  if (apiError && !attemptId && !trainingSet) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Ошибка: {apiError}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Повторить
        </button>
      </div>
    );
  }

  if (!trainingSet) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Не удалось загрузить модуль.</div>;
  }

 
  if (state.status === 'submitted') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h2>Попытка завершена!</h2>
        <p>ID попытки: {attemptId}</p>
        <p>Прогресс: {progress} из {trainingSet.tasks.length}</p>
        <AttemptReview
          tasks={trainingSet.tasks}
          answers={state.answers}
          canEdit={false}
          onClear={handleClearAnswer}
          onBackToTask={(id) => dispatch({ type: 'SELECT_TASK', taskId: id })}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>{trainingSet.title}</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Прогресс: {progress} из {trainingSet.tasks.length}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'task' })}
            style={{ fontWeight: state.viewMode === 'task' ? 'bold' : 'normal', cursor: 'pointer' }}
          >
            Задание
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'review' })}
            style={{ fontWeight: state.viewMode === 'review' ? 'bold' : 'normal', cursor: 'pointer' }}
          >
            Обзор ({state.answers.length}/{trainingSet.tasks.length})
          </button>
        </div>
      </header>

      {apiError && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '16px' }}>
          {apiError}
          <button onClick={() => setApiError(null)} style={{ marginLeft: '10px', cursor: 'pointer' }}>Закрыть</button>
        </div>
      )}

      <main>
        {state.viewMode === 'task' ? (
          <>
            <TaskList
              tasks={trainingSet.tasks}
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
            tasks={trainingSet.tasks}
            answers={state.answers}
            canEdit={canEdit}
            onClear={handleClearAnswer}
            onBackToTask={(id) => dispatch({ type: 'SELECT_TASK', taskId: id })}
          />
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}
          >
            {isSubmitting ? 'Завершение...' : 'Завершить попытку'}
          </button>
        </div>
      </main>
    </div>
  );
}