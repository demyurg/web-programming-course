import React, { useState, useEffect, useCallback } from 'react';

/* =========================
   ЗАДАЧА 2.1: Счетчик
   ========================= */

interface CounterState {
  count: number;
  step: number;
  isRunning: boolean;
  history: number[];
}

const defaultCounterState: CounterState = {
  count: 0,
  step: 1,
  isRunning: false,
  history: [],
};

const Counter: React.FC = () => {
  const [state, setState] = useState<CounterState>(defaultCounterState);

  const increment = useCallback(() => {
    setState(prev => {
      const next = { ...prev, count: prev.count + prev.step, history: [...prev.history, prev.count + prev.step] };
      return next;
    });
  }, []);

  const decrement = useCallback(() => {
    setState(prev => {
      const nextCount = prev.count - prev.step;
      const next = { ...prev, count: nextCount, history: [...prev.history, nextCount] };
      return next;
    });
  }, []);

  const setStep = (newStep: number) => {
    // обеспечить разумный минимум шага
    const step = Number.isNaN(newStep) ? 1 : Math.max(1, Math.trunc(newStep));
    setState(prev => ({ ...prev, step }));
  };

  const toggleRunning = () => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const reset = () => {
    setState(defaultCounterState);
  };

  // Автоинкремент: когда isRunning === true, увеличиваем каждую секунду
  useEffect(() => {
    if (!state.isRunning) return;

    const id = setInterval(() => {
      setState(prev => {
        const nextCount = prev.count + prev.step;
        return { ...prev, count: nextCount, history: [...prev.history, nextCount] };
      });
    }, 1000);

    return () => clearInterval(id);
  }, [state.isRunning, state.step]); // пересоздать интервал при смене шага или состояния

  return (
    <div className="counter">
      <h2>Счетчик: {state.count}</h2>
      <p>Шаг: {state.step}</p>

      <div className="controls">
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={toggleRunning}>{state.isRunning ? 'Остановить' : 'Запустить'}</button>
        <button onClick={reset}>Сброс</button>
      </div>

      <div className="step-control">
        <label>
          Шаг:
          <input
            type="number"
            value={state.step}
            onChange={(e) => setStep(Number(e.target.value))}
            min={1}
          />
        </label>
      </div>

      <div className="history">
        <h3>История:</h3>
        <ul>
          {state.history.length === 0 ? <li>Пусто</li> : state.history.map((v, i) => <li key={i}>{v}</li>)}
        </ul>
      </div>
    </div>
  );
};

/* =========================
   ЗАДАЧА 2.2: TodoApp
   ========================= */

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>('');

  const addTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = newTodoText.trim();
    if (!text) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTodos(prev => [newTodo, ...prev]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="todo-app">
      <h2>Todo приложение</h2>

      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Добавить новую задачу..."
        />
        <button type="submit">Добавить</button>
      </form>

      <ul className="todo-list">
        {todos.length === 0 && <li>Список пуст</li>}
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ marginLeft: 8 }}>{todo.text}</span>
            <button style={{ marginLeft: 12 }} onClick={() => deleteTodo(todo.id)}>Удалить</button>
          </li>
        ))}
      </ul>

      <div className="stats">
        <p>Всего: {todos.length}</p>
        <p>Завершено: {completedCount}</p>
      </div>
    </div>
  );
};

/* =========================
   ЗАДАЧА 2.3: Кастомные хуки
   ========================= */

// useToggle: возвращает [value, toggle]
function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState<boolean>(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}

// useCounter: простой счётчик
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}

/* =========================
   ЗАДАЧА 2.4: HooksDemo
   ========================= */

const HooksDemo: React.FC = () => {
  const counter = useCounter(5);
  const [on, toggleOn] = useToggle(false);

  return (
    <div className="hooks-demo">
      <h2>Демо кастомных хуков</h2>

      <div className="demo-section">
        <h3>useCounter</h3>
        <p>Count: {counter.count}</p>
        <button onClick={counter.increment}>+</button>
        <button onClick={counter.decrement}>-</button>
        <button onClick={counter.reset}>Reset</button>
      </div>

      <div className="demo-section" style={{ marginTop: 16 }}>
        <h3>useToggle</h3>
        <p>State: {on ? 'Вкл' : 'Выкл'}</p>
        <button onClick={toggleOn}>{on ? 'Выключить' : 'Включить'}</button>
      </div>
    </div>
  );
};

/* =========================
   ГЛАВНЫЙ КОМПОНЕНТ
   ========================= */

const TABS = {
  counter: {
    text: 'Счетчик',
    component: () => <Counter />,
  },
  todos: {
    text: 'Todo',
    component: () => <TodoApp />,
  },
  hooks: {
    text: 'Хуки',
    component: () => <HooksDemo />,
  },
} as const;

type TabKey = keyof typeof TABS;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('counter');

  return (
    <div className="app">
      <nav className="tabs">
        {Object.entries(TABS).map(([key, tab]) => {
          const k = key as TabKey;
          return (
            <button
              key={key}
              className={activeTab === k ? 'active' : ''}
              onClick={() => setActiveTab(k)}
            >
              {tab.text}
            </button>
          );
        })}
      </nav>

      <div className="tab-content">
        {TABS[activeTab].component()}
      </div>
    </div>
  );
};

export default App;
