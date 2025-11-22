import React, { useState } from "react";
// TODO 1.1
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

// TODO 1.2
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
}) => {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};

// TODO 1.3
interface UserCardProps {
  name: string;
  email: string;
  isOnline: boolean;
}

// TODO 1.4
const UserCard: React.FC<UserCardProps> = ({ name, email, isOnline }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <span className={isOnline ? "status-online" : "status-offline"}>
        {isOnline ? "🟢 Онлайн" : "🔴 Оффлайн"}
      </span>
    </div>
  );
};

// TODO 3.1
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// TODO 3.2 + 3.3
const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  // TODO 3.4
  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: inputValue.trim(),
          completed: false,
        },
      ]);
      setInputValue("");
    }
  };

  // TODO 3.5
  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // TODO 3.6
  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div className="todo-app">
      <h2>Todo список</h2>

      <div className="add-todo">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          placeholder="Новая задача..."
        />
        <Button onClick={addTodo} variant="primary">
          Добавить
        </Button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed-item" : ""}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.completed ? "completed" : ""}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)} className="delete-btn">
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="stats">
        Всего: {todos.length} | Завершено:{" "}
        {todos.filter((t) => t.completed).length}
      </div>
    </div>
  );
};
// TODO 3.7
const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Todo приложение на React + TypeScript</h1>

      {/* Примеры использования компонентов */}
      <div
        style={{
          marginBottom: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        <UserCard
          name="Анна Иванова"
          email="anna@example.com"
          isOnline={true}
        />
        <UserCard
          name="Пётр Петров"
          email="peter@example.com"
          isOnline={false}
        />
      </div>

      <TodoApp />
    </div>
  );
};

export default App;
