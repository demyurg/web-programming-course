import { useState } from 'react';
import { mainSet } from './demo';
import { TaskList } from './components/TaskList';
import { TaskCard } from './components/TaskCard';

export function App() {
  console.log('mainSet:', mainSet);
  console.log('tasks:', mainSet.tasks);
  console.log('tasks.length:', mainSet.tasks.length);

  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(
    mainSet.tasks.length > 0 ? mainSet.tasks[0].id : undefined
  );

  console.log('selectedTaskId:', selectedTaskId);

  const currentTask = mainSet.tasks.find((t) => t.id === selectedTaskId);
  console.log('currentTask:', currentTask);

  if (mainSet.tasks.length === 0 || !currentTask) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <h2>{mainSet.title}</h2>
        <p>Задания отсутствуют или выбраны некорректно.</p>
        <p>Длина массива: {mainSet.tasks.length}</p>
        <p>selectedTaskId: {selectedTaskId}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>{mainSet.title}</h1>
        <p style={{ margin: '5px 0 0', color: '#666' }}>
          Всего заданий: {mainSet.tasks.length}
        </p>
      </header>

      <main>
        <h2>Список заданий</h2>
        <TaskList
          tasks={mainSet.tasks}
          selectedId={selectedTaskId}
          onSelect={setSelectedTaskId}
        />

        <h2>Текущее задание</h2>
        <TaskCard task={currentTask} />
      </main>
    </div>
  );
}