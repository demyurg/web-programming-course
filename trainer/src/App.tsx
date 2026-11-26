import { useState } from 'react';
import { Task } from './domain.js';
import { mainSet } from './demo.js';
import { TaskList } from './components/TaskList.js';
import { TaskCard } from './components/TaskCard.js';

export function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(
    mainSet.tasks.length > 0 ? mainSet.tasks[0].id : undefined
  );

  const currentTask = mainSet.tasks.find((t) => t.id === selectedTaskId);

  if (mainSet.tasks.length === 0 || !currentTask) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <h2>{mainSet.title}</h2>
        <p>Задания отсутствуют или выбраны некорректно.</p>
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