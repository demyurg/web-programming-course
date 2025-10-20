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

// TODO 1.1: Интерфейс ButtonProps
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// TODO 1.2: Типизированный компонент Button
function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// TODO 1.3: Интерфейс UserCardProps
interface UserCardProps {
  name: string;
  email: string;
  isOnline: boolean;
}

// TODO 1.4: Типизированный компонент UserCard
function UserCard({ name, email, isOnline }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <span className={`${isOnline ? 'online' : 'offline'}`}>{isOnline ? 'Онлайн' : 'Оффлайн'}</span>
    </div>
  );
}

// ============================================
// ЧАСТЬ 2: Todo список
// ============================================

// TODO 3.1: Интерфейс Todo
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// TODO 3.2: Типизированный компонент TodoApp
function TodoApp() {
  // TODO 3.3: Создаем состояние todos с типом Todo[]
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // TODO 3.4: Реализуем addTodo
  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(), // Уникальное ID
        text: inputValue,
        completed: false,
      };
      setTodos([...todos, newTodo]); // Обновляем список задач
      setInputValue(''); // Очищаем поле ввода
    }
  };

  // TODO 3.5: Реализуем toggleTodo
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    ); // Меняем статус завершения задачи
  };

  // TODO 3.6: Реализуем deleteTodo
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id)); // Удаляем задачу по id
  };

  return (
    <div className="todo-app">
      <h2>Todo список</h2>

      {/* Формы добавления */}
      <div className="add-todo">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Новая задача..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()} // Отправляем форму нажатием Enter
        />
        <Button onClick={addTodo} variant="primary">Добавить</Button>
      </div>

      {/* Список todos */}
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.completed ? 'completed' : ''}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>✕</button>
          </li>
        ))}
      </ul>

      {/* Статистика */}
      <div className="stats">
        Всего: {todos.length} | Завершено: {todos.filter((t) => t.completed).length}
      </div>
    </div>
  );
}

// ============================================
// Главный компонент
// ============================================

// TODO 3.7: Типизированный компонент App
function App(): JSX.Element {
  return (
    <div className="app">
      <h1>Todo приложение на React + TypeScript</h1>
      <TodoApp />
    </div>
  );
}

export default App;