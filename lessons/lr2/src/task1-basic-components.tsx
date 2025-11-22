import React, { forwardRef, ForwardedRef } from "react";

interface UserCardProps {
  name: string;
  email: string;
  age?: number;
  avatar?: string;
  isOnline: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  name,
  email,
  age,
  avatar,
  isOnline,
}) => {
  return (
    <div className="user-card">
      {avatar && <img src={avatar} alt={name} className="user-avatar" />}
      <h2>{name}</h2>
      <p>{email}</p>
      {age !== undefined && <p>Возраст: {age}</p>}
      <span
        className={`status ${isOnline ? "status--online" : "status--offline"}`}
      >
        {isOnline ? "🟢 Онлайн" : "🔴 Оффлайн"}
      </span>
    </div>
  );
};

interface ButtonProps {
  children: React.ReactNode;
  variant: "primary" | "secondary" | "danger";
  size: "small" | "medium" | "large";
  disabled?: boolean;
  onClick: () => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant, size, disabled = false, onClick },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <button
        ref={ref}
        className={`btn btn--${variant} btn--${size}`}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

interface UserListProps {
  users: string[];
  emptyMessage?: string;
}

const UserList: React.FC<UserListProps> = ({
  users,
  emptyMessage = "Нет пользователей",
}) => {
  if (users.length === 0) {
    return <p className="empty-message">{emptyMessage}</p>;
  }

  return (
    <ul className="user-list">
      {users.map((user, index) => (
        <li key={index}>{user}</li>
      ))}
    </ul>
  );
};

interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  className = "",
}) => {
  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

function List<T>({
  items,
  renderItem,
  emptyMessage = "Список пуст",
}: ListProps<T>) {
  if (items.length === 0) {
    return <p className="empty-message">{emptyMessage}</p>;
  }

  return <>{items.map((item, index) => renderItem(item, index))}</>;
}

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isOnline: boolean;
}

const App: React.FC = () => {
  const users: User[] = [
    {
      id: 1,
      name: "Анна Иванова",
      email: "anna@example.com",
      age: 28,
      isOnline: true,
    },
    {
      id: 2,
      name: "Петр Петров",
      email: "petr@example.com",
      age: 35,
      isOnline: false,
    },
    {
      id: 3,
      name: "Мария Сидорова",
      email: "maria@example.com",
      age: 24,
      isOnline: true,
    },
  ];

  const userNames = users.map((user) => user.name);

  const handleButtonClick = () => {
    alert("Кнопка нажата!");
  };

  return (
    <div className="app">
      <h1>Задание 1: Базовые компоненты</h1>

      <Card
        title="Список пользователей"
        footer={<strong>Всего: {users.length} чел.</strong>}
        className="main-card"
      >
        <UserList users={userNames} />

        {/* Демонстрация разных кнопок */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Button variant="primary" size="large" onClick={handleButtonClick}>
            Primary Large
          </Button>
          <Button variant="secondary" size="medium" onClick={handleButtonClick}>
            Secondary
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={handleButtonClick}
            disabled
          >
            Disabled
          </Button>
        </div>

        {/* Демонстрация UserCard */}
        <div
          style={{
            marginTop: "30px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {users.map((user) => (
            <UserCard
              key={user.id}
              name={user.name}
              email={user.email}
              age={user.age}
              isOnline={user.isOnline}
              avatar="https://via.placeholder.com/80"
            />
          ))}
        </div>

        {/* БОНУС: Generic List */}
        <Card title="Бонус: Generic List<T>">
          <List
            items={users}
            renderItem={(user) => (
              <div
                key={user.id}
                style={{ padding: "10px", borderBottom: "1px solid #eee" }}
              >
                {user.name} — {user.email}
              </div>
            )}
          />
        </Card>
      </Card>
    </div>
  );
};

export default App;
