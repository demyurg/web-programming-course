import React, { useState } from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

interface UserCardProps {
  name: string;
  email: string;
  isOnline: boolean;
}

function UserCard({ name, email, isOnline }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <span className={isOnline ? "status online" : "status offline"}>
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoApp(): JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
      };
      setTodos((prev) => [newTodo, ...prev]);
      setInputValue("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="todo-app">
      <h2>Todo список</h2>

      <div className="add-todo">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Новая задача..."
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
        />
        <Button onClick={addTodo} variant="primary">
          Добавить
        </Button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.completed ? "completed" : ""}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>✕</button>
          </li>
        ))}
      </ul>

      <div className="stats">
        Всего: {todos.length} | Завершено:{" "}
        {todos.filter((t) => t.completed).length}
      </div>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <div className="app">
      <h1>Todo приложение на React + TypeScript</h1>
      <TodoApp />
    </div>
  );
}

export default App;
