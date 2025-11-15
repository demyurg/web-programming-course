/**
 * Задание 2: Типизация хуков и состояния
 *
 * Цель: Освоить типизацию useState, useEffect и простых кастомных хуков
 *
 * Инструкции:
 * 1. Добавьте правильную типизацию ко всем хукам
 * 2. Создайте простые типизированные кастомные хуки
 * 3. Обработайте основные состояния приложения
 */

import { useState, useEffect, useCallback } from 'react';

// ===== ЗАДАЧА 2.1: Счетчик с расширенным состоянием =====

// TODO: Определите интерфейс CounterState со следующими свойствами:
// - count: number
// - step: number
// - isRunning: boolean
// - history: number[]

interface CounterState {
  count: number;
  step: number;
  isRunning: boolean;
  history: number[];
}

// TODO: Типизируйте компонент Counter
function Counter() {
    const [state, setState] = useState<CounterState>({
    count: 0,
    step: 1,
    isRunning: false,
    history: [],
  });
  // TODO: Добавьте типизацию к функциям
  const increment = () => {
    setState((prev) => ({
      ...prev,
      count: prev.count + prev.step,
      history: [...prev.history, prev.count + prev.step],
    }));
  };

  const decrement = () => {
     setState((prev) => ({
      ...prev,
      count: prev.count - prev.step,
      history: [...prev.history, prev.count - prev.step],
    }));
  };

  const setStep = (newStep: number) => {
    setState((prev) => ({ ...prev, step: newStep }));
  };

  const toggleRunning = () => {
    // TODO: реализуйте переключение автоинкремента
  };

  const reset = () => {
      setState({
      count: 0,
      step: 1,
      isRunning: false,
      history: [],
    });
  };

  // TODO: Добавьте useEffect с типизацией для автоинкремента
   useEffect(() => {
    if (!state.isRunning) return;
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        count: prev.count + prev.step,
        history: [...prev.history, prev.count + prev.step],
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, state.step]);

 return (
    <div className="counter">
      <h2>Счетчик: {state.count}</h2>
      <p>Шаг: {state.step}</p>

      <div className="controls">
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={toggleRunning}>
          {state.isRunning ? 'Остановить' : 'Запустить'}
        </button>
        <button onClick={reset}>Сброс</button>
      </div>

      <div className="step-control">
        <label>
          Шаг:
          <input
            type="number"
            value={state.step}
            onChange={(e) => setStep(Number(e.target.value))}
            min="1"
          />
        </label>
      </div>

      <div className="history">
        <h3>История:</h3>
        <ul>
          {state.history.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ===== ЗАДАЧА 2.2: Простое todo приложение =====

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// TODO: Типизируйте компонент TodoApp
function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>('');

  const addTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
      };
      setTodos((prev) => [...prev, newTodo]);
      setNewTodoText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // TODO: Посчитайте количество завершенных todos
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="todo-app">
      <h2>Todo приложение</h2>

      {/* TODO: Форма добавления */}
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Добавить новую задачу..."
        />
        <button type="submit">Добавить</button>
      </form>

      {/* TODO: Список todos */}
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Удалить</button>
          </li>
        ))}
      </ul>

      {/* TODO: Отобразите статистику */}
      <div className="stats">
        <p>Всего: {todos.length}</p>
        <p>Завершено: {completedCount}</p>
      </div>
    </div>
  );
}

// ===== ЗАДАЧА 2.3: Кастомные хуки =====

// TODO: Создайте типизированный хук useToggle
// Параметры: initialValue?: boolean
// Возвращает: [boolean, () => void] (value, toggle)
function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState<boolean>(initialValue);
  const toggle = useCallback(() => setValue((prev) => !prev), []);
  return [value, toggle];
}

// TODO: Создайте типизированный хук useCounter
// Параметры: initialValue?: number
// Возвращает: { count: number, increment: () => void, decrement: () => void, reset: () => void }
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}

// ===== ЗАДАЧА 2.4: Демо компонент для кастомных хуков =====

// TODO: Типизируйте компонент HooksDemo
function HooksDemo() {
  const { count, increment, decrement, reset } = useCounter(5);
  const [isVisible, toggleVisible] = useToggle(true);

  return (
    <div className="hooks-demo">
      <h2>Демо кастомных хуков</h2>

      <div className="demo-section">
        <h3>useCounter</h3>
        <p>Текущее значение: {count}</p>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Сброс</button>
      </div>

      {/* TODO: Демо useToggle */}
      <div className="demo-section">
        <h3>useToggle</h3>
        <p>Состояние: {isVisible ? 'Видно' : 'Скрыто'}</p>
        <button onClick={toggleVisible}>Переключить</button>
      </div>
    </div>
  );
}

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====
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
};

type TabKey = keyof typeof TABS;

// TODO: Типизируйте компонент App
function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('counter');

  return (
    <div className="app">
      <nav className="tabs">
        {Object.entries(TABS).map(([key, tab]) => (
          <button
            key={key}
            className={activeTab === key ? 'active' : ''}
            onClick={() => setActiveTab(key as TabKey)}
          >
            {tab.text}
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {TABS[activeTab].component()}
      </div>
    </div>
  );
}

export default App;

// ===== БОНУСНЫЕ ЗАДАЧИ =====

// TODO BONUS 1: Создайте хук useLocalStorage
// Параметры: key: string, initialValue: T
// Возвращает: [T, (value: T | ((val: T) => T)) => void]
// TODO BONUS 2: Создайте хук usePrevious для отслеживания предыдущего значения
// TODO BONUS 3: Реализуйте TodoApp с useReducer вместо useState