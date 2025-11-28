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

import { useState, useEffect, useCallback, FormEvent } from 'react';

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
  // TODO: Добавьте типизацию к useState
  const [state, setState] = useState<CounterState>({
    count: 0,
    step: 1,
    isRunning: false,
    history: []
  });

  // TODO: Добавьте типизацию к функциям
  const increment = () => {
    setState(prevState => ({
      ...prevState,
      count: prevState.count + prevState.step,
      history: [...prevState.history, prevState.count + prevState.step]
    }));
  };

  const decrement = () => {
    setState(prevState => ({
      ...prevState,
      count: prevState.count - prevState.step,
      history: [...prevState.history, prevState.count - prevState.step]
    }));
  };

  const setStep = (newStep: number) => {
    setState(prevState => ({
      ...prevState,
      step: newStep
    }));
  };

  const toggleRunning = () => {
    setState(prevState => ({
      ...prevState,
      isRunning: !prevState.isRunning
    }));
  };

  const reset = () => {
    setState({
      count: 0,
      step: 1,
      isRunning: false,
      history: []
    });
  };

  // TODO: Добавьте useEffect с типизацией для автоинкремента
  useEffect(() => {
    let intervalId: number;
    
    if (state.isRunning) {
      intervalId = window.setInterval(() => {
        increment();
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isRunning, state.step]);

  return (
    <div className="counter">
      <h2>Счетчик: {state.count}</h2>
      <p>Шаг: {state.step}</p>

      <div className="controls">
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={toggleRunning}>
          {state.isRunning ? 'Пауза' : 'Старт'}
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

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false
      };
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setNewTodoText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  // TODO: Посчитайте количество завершенных todos
  const completedCount = todos.filter(todo => todo.completed).length;

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
    setValue(prevValue => !prevValue);
  }, []);

  return [value, toggle];
}

// TODO: Создайте типизированный хук useCounter
// Параметры: initialValue?: number
// Возвращает: { count: number, increment: () => void, decrement: () => void, reset: () => void }
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback(() => {
    setCount(prevCount => prevCount + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prevCount => prevCount - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

// ===== ЗАДАЧА 2.4: Демо компонент для кастомных хуков =====

// TODO: Типизируйте компонент HooksDemo
function HooksDemo() {
  // TODO: Используйте созданные кастомные хуки
  const [isToggled, toggle] = useToggle(false);
  const { count, increment, decrement, reset } = useCounter(0);

  return (
    <div className="hooks-demo">
      <h2>Демо кастомных хуков</h2>

      {/* TODO: Демо useCounter */}
      <div className="demo-section">
        <h3>useCounter</h3>
        <p>Счетчик: {count}</p>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Сброс</button>
      </div>

      {/* TODO: Демо useToggle */}
      <div className="demo-section">
        <h3>useToggle</h3>
        <p>Состояние: {isToggled ? 'ВКЛ' : 'ВЫКЛ'}</p>
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