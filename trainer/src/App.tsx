import { useState } from "react";
import { webBasics } from "./data";
import { findTask } from "./domain";
import type { TrainingSet } from "./domain";
import TaskList from "./components/TaskList";
import TaskCard from "./components/TaskCard";

type AppProps = {
  trainingSet?: TrainingSet;
};

export default function App({ trainingSet = webBasics }: AppProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    () => trainingSet.tasks[0]?.id ?? "",
  );
  const selectedTask = findTask(trainingSet, selectedTaskId);

  return (
    <main className="trainer">
      <div className="brand"><span className="brand-mark" aria-hidden="true">W.</span> Учебный тренажёр</div>
      <header className="module-header">
        <p className="eyebrow">Учебный модуль</p>
        <h1>{trainingSet.title}</h1>
        <p className="module-description">Изучайте задания и переключайтесь между темами в своём темпе.</p>
        <p className="task-count">Количество заданий: {trainingSet.tasks.length}</p>
      </header>

      {trainingSet.tasks.length === 0 ? (
        <section className="empty-state" aria-label="Пустой модуль">
          <h2>В этом модуле пока нет заданий</h2>
          <p>Задания появятся здесь, когда модуль будет подготовлен.</p>
        </section>
      ) : (
        <div className="workspace">
          <TaskList tasks={trainingSet.tasks} selectedTaskId={selectedTaskId} onChoose={setSelectedTaskId} />
          {selectedTask ? (
            <TaskCard task={selectedTask} />
          ) : (
            <section className="empty-state" aria-label="Задание не найдено">
              <h2>Выберите задание</h2>
              <p>Текущее задание отсутствует в модуле. Выберите другое из списка.</p>
            </section>
          )}
        </div>
      )}
      <footer className="footer">Веб-программирование <span>Изучение заданий</span></footer>
    </main>
  );
}
