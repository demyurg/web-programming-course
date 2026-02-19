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

// TODO 1.1: Создайте интерфейс ButtonProps с полями:
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void 
  variant?: 'primary' | 'secondary'
}

// TODO 1.2: Типизируйте компонент Button
function Button({children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      className={`btn btn--${{variant}}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// TODO 1.3: Создайте интерфейс UserCardProps с полями:
interface UserCardProps {
  name: string
  email: string
  isOnline: boolean
}

// TODO 1.4: Типизируйте компонент UserCard
function UserCard({ name, email, isOnline }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <span className={isOnline ? "status online" : "status offline"}>
        {isOnline ? "Онлайн" : "Оффлайн"}
      </span>
    </div>
  );
}

// ============================================
// ЧАСТЬ 2: Todo список
// ============================================

// TODO 3.1: Создайте интерфейс Todo с полями:
interface Todo {
  id: number
  text: string
  completed: boolean
}

// TODO 3.2: Типизируйте компонент TodoApp
function TodoApp() {
  // TODO 3.3: Создайте состояние todos с типом Todo[]
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  // TODO 3.4: Реализуйте addTodo
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

  // TODO 3.5: Реализуйте toggleTodo
  const toggleTodo = (id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // TODO 3.6: Реализуйте deleteTodo
  const deleteTodo = (id: number) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-app">
      <h2>Todo список</h2>

      {/* TODO: Форма добавления */}
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

      {/* TODO: Список todos */}
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
        Всего: {todos.length} | Завершено: {todos.filter(t => t.completed).length}
      </div>
    </div>
  );
}

// ============================================
// Главный компонент
// ============================================

// TODO 3.7: Типизируйте компонент App
function App() {
  return (
    <div className="app">
      <h1>Todo приложение на React + TypeScript</h1>
      <UserCard
        name="Иван"
        email="ivan@example.com"
        isOnline={true}
      />
      <TodoApp />
    </div>
  );
}

export default App;
