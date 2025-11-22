import React, { useState, useEffect, useCallback, useReducer } from "react";

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
    history: [],
  });

  const increment = useCallback(() => {
    setState((prev) => ({
      ...prev,
      count: prev.count + prev.step,
      history: [...prev.history, prev.count + prev.step],
    }));
  }, []);

  const decrement = useCallback(() => {
    setState((prev) => ({
      ...prev,
      count: prev.count - prev.step,
      history: [...prev.history, prev.count - prev.step],
    }));
  }, []);

  const setStep = (newStep: number) => {
    if (newStep > 0) {
      setState((prev) => ({ ...prev, step: newStep }));
    }
  };

  const toggleRunning = () => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const reset = () => {
    setState({
      count: 0,
      step: 1,
      isRunning: false,
      history: [],
    });
  };

  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      increment();
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, increment]);

  return (
    <div className="counter">
      <h2>Счетчик: {state.count}</h2>
      <p>Шаг: {state.step}</p>

      <div className="controls">
        <button onClick={increment}>+ {state.step}</button>
        <button onClick={decrement}>- {state.step}</button>
        <button onClick={toggleRunning}>
          {state.isRunning ? "⏸ Пауза" : "▶ Авто +1/сек"}
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
        <h3>История изменений:</h3>
        <ul>
          {state.history.map((value, i) => (
            <li key={i}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>("");

  const addTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      setTodos((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: newTodoText.trim(),
          completed: false,
        },
      ]);
      setNewTodoText("");
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

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="todo-app">
      <h2>Todo приложение</h2>

      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Новая задача..."
        />
        <button type="submit">Добавить</button>
      </form>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>✕</button>
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

function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue((prev) => !prev);
  return [value, toggle];
}

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

function useCounter(initialValue: number = 0): UseCounterReturn {
  const [count, setCount] = useState(initialValue);
  return {
    count,
    increment: () => setCount((c) => c + 1),
    decrement: () => setCount((c) => c - 1),
    reset: () => setCount(initialValue),
  };
}

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

function usePrevious<T>(value: T): T | undefined {
  const [current, setCurrent] = useState<T>(value);
  const [previous, setPrevious] = useState<T | undefined>(undefined);

  useEffect(() => {
    setPrevious(current);
    setCurrent(value);
  }, [value]);

  return previous;
}

type TodoAction =
  | { type: "ADD"; text: string }
  | { type: "TOGGLE"; id: string }
  | { type: "DELETE"; id: string };

function todoReducer(todos: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case "ADD":
      return [
        ...todos,
        { id: Date.now().toString(), text: action.text, completed: false },
      ];
    case "TOGGLE":
      return todos.map((t) =>
        t.id === action.id ? { ...t, completed: !t.completed } : t
      );
    case "DELETE":
      return todos.filter((t) => t.id !== action.id);
    default:
      return todos;
  }
}

const TodoAppWithReducer: React.FC = () => {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [text, setText] = useState("");

  return (
    <div className="todo-reducer">
      <h3>Todo с useReducer</h3>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button
        onClick={() => {
          dispatch({ type: "ADD", text });
          setText("");
        }}
      >
        Добавить
      </button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => dispatch({ type: "TOGGLE", id: t.id })}
            />
            {t.text}
            <button onClick={() => dispatch({ type: "DELETE", id: t.id })}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const HooksDemo: React.FC = () => {
  const [isOn, toggle] = useToggle(false);
  const { count, increment, decrement, reset } = useCounter(10);
  const [savedValue, setSavedValue] = useLocalStorage("demo-key", "Привет!");
  const previousCount = usePrevious(count);

  return (
    <div className="hooks-demo">
      <h2>Демо кастомных хуков</h2>

      <div className="demo-section">
        <h3>useCounter</h3>
        <p>
          Текущее: {count} | Предыдущее: {previousCount ?? "—"}
        </p>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
        <button onClick={reset}>Сброс</button>
      </div>

      <div className="demo-section">
        <h3>useToggle</h3>
        <p>Состояние: {isOn ? "ВКЛ" : "ВЫКЛ"}</p>
        <button onClick={toggle}>Переключить</button>
      </div>

      <div className="demo-section">
        <h3>useLocalStorage</h3>
        <p>Сохранено: {savedValue}</p>
        <button
          onClick={() =>
            setSavedValue("Обновлено в " + new Date().toLocaleTimeString())
          }
        >
          Обновить
        </button>
      </div>

      <TodoAppWithReducer />
    </div>
  );
};

type TabKey = keyof typeof TABS;

const TABS = {
  counter: { text: "Счетчик", component: () => <Counter /> },
  todos: { text: "Todo", component: () => <TodoApp /> },
  hooks: { text: "Хуки", component: () => <HooksDemo /> },
} as const;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("counter");

  return (
    <div className="app">
      <h1>Задание 2: Хуки и состояние</h1>

      <nav className="tabs">
        {Object.entries(TABS).map(([key, tab]) => (
          <button
            key={key}
            className={activeTab === key ? "active" : ""}
            onClick={() => setActiveTab(key as TabKey)}
          >
            {tab.text}
          </button>
        ))}
      </nav>

      <div className="tab-content">{TABS[activeTab].component()}</div>
    </div>
  );
};

export default App;
