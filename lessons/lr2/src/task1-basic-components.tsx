/**
 * Задание 1: Базовые типизированные компоненты
 *
 * Цель: Научиться создавать простые типизированные React компоненты
 *
 * Инструкции:
 * 1. Создайте интерфейсы для всех props
 * 2. Добавьте правильную типизацию к компонентам
 * 3. Убедитесь что все компоненты работают без ошибок TypeScript
 */

import React from 'react';

// ===== ЗАДАЧА 1.1: Простая карточка пользователя =====

interface UserCardProps {
  name: string;
  email: string;
  age?: number;
  avatar?: string;
  isOnline: boolean;
}

const UserCard: React.FC<UserCardProps> = (props: UserCardProps) => {
  const { name, email, age, avatar, isOnline } = props;
  return (
    <div className="user-card">
      {avatar && <img src={avatar} alt={name} className="user-card__avatar" style={{ width: 48, height: 48, borderRadius: '50%' }} />}
      <h2>{name}</h2>
      <p>{email}</p>
      {typeof age === 'number' && <p>Возраст: {age}</p>}
      <span className={`status ${isOnline ? 'status--online' : 'status--offline'}`}>{isOnline ? 'Онлайн' : 'Оффлайн'}</span>
    </div>
  );
};

// ===== ЗАДАЧА 1.2: Кнопка с вариантами =====

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children: React.ReactNode;
  variant: ButtonVariant;
  size: ButtonSize;
  disabled?: boolean;
  onClick: () => void;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant, size, disabled = false, onClick }, ref) => {
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
Button.displayName = 'Button';

// ===== ЗАДАЧА 1.3: Простой список пользователей =====

interface UserListProps {
  users: string[];
  emptyMessage?: string;
}

const UserList: React.FC<UserListProps> = (props: UserListProps) => {
  const { users, emptyMessage = 'Нет пользователей' } = props;
  if (!users.length) {
    return <div>{emptyMessage}</div>;
  }
  return (
    <ul className="user-list">
      {users.map((name, idx) => (
        <li key={idx}>{name}</li>
      ))}
    </ul>
  );
};

// ===== ЗАДАЧА 1.4: Карточка с children =====

interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = (props: CardProps) => {
  const { title, children, footer, className } = props;
  return (
    <div className={`card${className ? ' ' + className : ''}`}>
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

// ===== ЗАДАЧА 1.5: Демо компонент =====

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isOnline: boolean;
}

// Типизируйте компонент App
const App: React.FC = () => {
  const users: User[] = [
    { id: 1, name: 'Анна Иванова', email: 'anna@example.com', age: 28, isOnline: true },
    { id: 2, name: 'Петр Петров', email: 'petr@example.com', age: 35, isOnline: false },
    { id: 3, name: 'Мария Сидорова', email: 'maria@example.com', age: 24, isOnline: true }
  ];

  const userNames = users.map(user => user.name);

  const handleButtonClick = () => {
    console.log('Кнопка нажата!');
  };

  return (
    <div className="app">
      <Card
        title="Список пользователей"
        footer={<p>Всего пользователей: {users.length}</p>}
      >
        <UserList
          users={userNames}
          emptyMessage="Пользователей не найдено"
        />

        <div style={{ marginTop: '20px' }}>
          <Button
            variant="primary"
            size="medium"
            onClick={handleButtonClick}
          >
            Добавить пользователя
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default App;

// ===== БОНУСНЫЕ ЗАДАЧИ =====


// BONUS 1: Utility типы (пример: Partial для UserCardProps)
type UserCardPartial = Partial<UserCardProps> & Pick<UserCardProps, 'name' | 'email' | 'isOnline'>;

// BONUS 2: Generic List компонент с render prop
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

function List<T>({ items, renderItem, emptyMessage }: ListProps<T>) {
  if (!items.length) return <div>{emptyMessage ?? 'Нет элементов'}</div>;
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item, i)}</li>)}</ul>;
}