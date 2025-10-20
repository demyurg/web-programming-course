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

interface CounterState {
  count: number;
  step: number;
  isRunning: boolean;
  history: number[];
}

const Counter: React.FC = () => {
  const [state, setState] = useState<CounterState>({
    count: 0,
    step: 1,
    isRunning: false,
    history: [0],
  });

  const increment = () => {
    setState(prev => {
      const newCount = prev.count + prev.step;
      return {
        ...prev,
        count: newCount,
        history: [...prev.history, newCount],
      };
    });
  };

  const decrement = () => {
    setState(prev => {
      const newCount = prev.count - prev.step;
      return {
        ...prev,
        count: newCount,
        history: [...prev.history, newCount],
      };
    });
  };

  const setStep = (newStep: number) => {
    setState(prev => ({ ...prev, step: newStep }));
  };

  const toggleRunning = () => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const reset = () => {
    setState({ count: 0, step: 1, isRunning: false, history: [0] });
  };

  useEffect(() => {
    if (!state.isRunning) return;
    const interval = setInterval(() => {
      setState(prev => {
        const newCount = prev.count + prev.step;
        return {
          ...prev,
          count: newCount,
          history: [...prev.history, newCount],
        };
      });
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
          {state.history.map((val, idx) => (
            <li key={idx}>{val}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ===== ЗАДАЧА 2.2: Простое todo приложение =====

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
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText,
        completed: false,
      };
      setTodos(prev => [...prev, newTodo]);
      setNewTodoText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
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
        <button type="submit">
          Добавить
        </button>
      </form>

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

      <div className="stats">
        <p>Всего: {todos.length}</p>
        <p>Завершено: {completedCount}</p>
      </div>
    </div>
  );
};

// ===== ЗАДАЧА 2.3: Кастомные хуки =====


function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState<boolean>(initialValue);
  const toggle = () => setValue(v => !v);
  return [value, toggle];
}


function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState<number>(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);
  return { count, increment, decrement, reset };
}

// ===== ЗАДАЧА 2.4: Демо компонент для кастомных хуков =====


const HooksDemo: React.FC = () => {
  const { count, increment, decrement, reset } = useCounter(5);
  const [on, toggle] = useToggle(false);

  return (
    <div className="hooks-demo">
      <h2>Демо кастомных хуков</h2>

      <div className="demo-section">
        <h3>useCounter</h3>
        <p>Значение: {count}</p>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Сброс</button>
      </div>

      <div className="demo-section">
        <h3>useToggle</h3>
        <p>Состояние: {on ? 'Включено' : 'Выключено'}</p>
        <button onClick={toggle}>Переключить</button>
      </div>
    </div>
  );
};

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
  'hooks': {
    'text': 'Хуки',
    'component': () => <HooksDemo />,
  },
};


const App: React.FC = () => {
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
};

export default App;

// ===== БОНУСНЫЕ ЗАДАЧИ =====

// TODO BONUS 1: Создайте хук useLocalStorage
// Параметры: key: string, initialValue: T
// Возвращает: [T, (value: T | ((val: T) => T)) => void]
// TODO BONUS 2: Создайте хук usePrevious для отслеживания предыдущего значения
// TODO BONUS 3: Реализуйте TodoApp с useReducer вместо useState