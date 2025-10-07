import React, { useState } from 'react';

/**
 * ЗАДАНИЕ 1-2: Основы React + TypeScript
 */

// ============================================
// ЧАСТЬ 1: Простые компоненты
// ============================================

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}



// ============================================
// ЧАСТЬ 2: Todo список
// ============================================

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// ✅ Начальный список задач
const initialTodos: Todo[] = [
  { id: 1, text: 'Купить хлеб', completed: false },
  { id: 2, text: 'Выучить TypeScript', completed: true },
];

function TodoApp() {
  // ✅ Используем initialTodos как стартовое состояние
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [inputValue, setInputValue] = useState('');

  // Добавление задачи
  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  // Переключение completed
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Удаление задачи
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="todo-app">
      <h2>Todo список</h2>

      {/* Добавление новой задачи */}
      <div className="add-todo">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Новая задача..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <Button onClick={addTodo} variant="primary">
          Добавить
        </Button>
      </div>

      {/* Список задач */}
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.completed ? 'completed' : ''}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>✕</button>
          </li>
        ))}
      </ul>

      {/* Статистика */}
      <div className="stats">
        Всего: {todos.length} | Завершено:{' '}
        {todos.filter((t) => t.completed).length}
      </div>
    </div>
  );
}

// ============================================
// Главный компонент
// ============================================

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Todo приложение на React + TypeScript</h1>
      <TodoApp />
    </div>
  );
};

export default App;
