/**
 * ЗАДАНИЕ 1-2: Основы React + TypeScript
 *
 * Упрощенное задание, объединяющее базовые компоненты и хуки
 *
 * Что будем изучать:
 * - Типизация компонентов и props
 * - Работа с useState
 * - Обработка событий
 */

import React, { useState } from 'react';

// ============================================
// ЧАСТЬ 1: Простые компоненты
// ============================================

// 1.1 — интерфейс для кнопки
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// 1.2 — типизированный компонент Button
function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// 1.3 — интерфейс для карточки пользователя
interface UserCardProps {
  name: string;
  email: string;
  isOnline: boolean;
}

// 1.4 — типизированный компонент UserCard
function UserCard({ name, email, isOnline }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <span className={isOnline ? 'status online' : 'status offline'}>
        {isOnline ? 'В сети' : 'Не в сети'}
      </span>
    </div>
  );
}

// ============================================
// ЧАСТЬ 2: Todo список
// ============================================

// 3.1 — интерфейс для задачи
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// 3.2 — компонент TodoApp
function TodoApp() {
  // 3.3 — состояние списка задач
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  // 3.4 — добавление задачи
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

  // 3.5 — переключение completed
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 3.6 — удаление задачи
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-app">
      <h2>Todo список</h2>

      {/* Форма добавления */}
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
        {todos.map(todo => (
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
        {todos.filter(t => t.completed).length}
      </div>
    </div>
  );
}

// ============================================
// Главный компонент
// ============================================

function App() {
  return (
    <div className="app">
      <h1>Todo приложение на React + TypeScript</h1>
      <UserCard name="Иван Петров" email="ivan@example.com" isOnline={true} />
      <TodoApp />
    </div>
  );
}

export default App;
