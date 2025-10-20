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
function Counter(): JSX.Element {
  // TODO: Добавьте типизацию к useState
  const [state, setState] = useState<CounterState>({
    count: 0,
    step: 1,
    isRunning: false,
    history: []
  });

  // TODO: Добавьте типизацию к функциям
  const increment = useCallback((): void => {
    // TODO: реализуйте increment с обновлением истории
  }, []);

  const decrement = useCallback((): void => {
    // TODO: реализуйте decrement с обновлением истории
  }, []);

  const setStep = (newStep: number): void => {
    // TODO: реализуйте изменение шага
  };

  const toggleRunning = (): void => {
    // TODO: реализуйте переключение автоинкремента
  };

  const reset = (): void => {
    // TODO: реализуйте сброс состояния
  };

  // TODO: Добавьте useEffect с типизацией для автоинкремента
  useEffect(() => {
    // TODO: реализуйте автоинкремент когда isRunning === true
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
function TodoApp(): JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>('');

  const addTodo = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // TODO: создайте новую todo и добавьте в массив
  };

  const toggleTodo = (id: string): void => {
    // TODO: измените completed статус для todo с данным id
  };

  const deleteTodo = (id: string): void => {
    // TODO: удалите todo с данным id
  };

  // TODO: Посчитайте количество завершенных todos
  const completedCount: number = 0;

  return (
    <div className="todo-app">
      <h2>Todo приложение</h2>

      {/* TODO: Форма добавления */}
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTodoText(e.target.value)}
          placeholder="Добавить новую задачу..."
        />
        <button type="submit">
          Добавить
        </button>
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

  const toggle = useCallback(() => {
    // TODO: реализуйте логику переключения
  }, []);

  return [value, toggle];
}

// TODO: Создайте типизированный хук useCounter
// Параметры: initialValue?: number
// Возвращает: { count: number, increment: () => void, decrement: () => void, reset: () => void }
function useCounter(initialValue: number = 0): {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
} {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback(() => {
    // TODO: реализуйте увеличение
  }, []);

  const decrement = useCallback(() => {
    // TODO: реализуйте уменьшение
  }, []);

  const reset = useCallback(() => {
    // TODO: реализуйте сброс
  }, []);

  return { count, increment, decrement, reset };
}

// ===== ЗАДАЧА 2.4: Демо компонент для кастомных хуков =====

// TODO: Типизируйте компонент HooksDemo
function HooksDemo(): JSX.Element {
  // TODO: Используйте созданные кастомные хуки
  const [value, toggle] = useToggle();
  const { count, increment, decrement, reset } = useCounter();

  return (
    <div className="hooks-demo">
      <h2>Демо кастомных хуков</h2>

      {/* TODO: Демо useCounter */}
      <div className="demo-section">
        <h3>useCounter</h3>
        <p>Счётчик: {count}</p>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Сброс</button>
      </div>

      {/* TODO: Демо useToggle */}
      <div className="demo-section">
        <h3>useToggle</h3>
        <p>Состояние: {value ? 'Вкл' : 'Выкл'}</p>
        <button onClick={toggle}>Переключить</button>
      </div>
    </div>
  );
}

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====
const TABS = {
  'counter': {
    'text': 'Счетчик',
    'component': () => <Counter />,
  },
  'todos': {
    'text': 'Todo',
    'component': () => <TodoApp />,
  },
  'hooks':{
    'text': 'Хуки',
    'component': () => <HooksDemo />,
  },
};

// TODO: Типизируйте компонент App
function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<keyof typeof TABS>('counter');

  return (
    <div className="app">
      <nav className="tabs">
        {Object.entries(TABS).map(([key, tab]) => (
          <button
            key={key}
            className={activeTab === key ? 'active' : ''}
            onClick={() => setActiveTab(key as keyof typeof TABS)}
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
