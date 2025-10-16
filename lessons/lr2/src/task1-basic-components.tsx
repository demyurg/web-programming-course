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
// TODO: Создайте интерфейс UserCardProps со следующими свойствами:
// - name: string
// - email: string
// - age: number (опциональное)
// - avatar: string (опциональное)
// - isOnline: boolean

interface UserCardProps {
  name: string;
  email: string;
  age?: number;
  avatar?: string;
  isOnline: boolean;
}

// TODO: Типизируйте компонент UserCard
function UserCard({ name, email, age, avatar, isOnline }: UserCardProps) {
  return (
    <div className="user-card">
      {avatar && <img src={avatar} alt={`${name} avatar`} className="avatar" />}
      <h2>{name}</h2>
      <p>{email}</p>
      {age && <p>Возраст: {age}</p>}
      <span className={`status ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? 'Онлайн' : 'Оффлайн'}
      </span>
    </div>
  );
}

// ===== ЗАДАЧА 1.2: Кнопка с вариантами =====

// TODO: Создайте интерфейс ButtonProps со следующими свойствами:
// - children: React.ReactNode
// - variant: 'primary' | 'secondary' | 'danger'
// - size: 'small' | 'medium' | 'large'
// - disabled: boolean (опциональное, по умолчанию false)
// - onClick: () => void

interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
}

// TODO: Типизируйте компонент Button
function Button({children, variant, size, disabled = false, onClick}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ===== ЗАДАЧА 1.3: Простой список пользователей =====

// TODO: Создайте интерфейс UserListProps со следующими свойствами:
// - users: string[] (массив имен пользователей)
// - emptyMessage: string (опциональное, по умолчанию "Нет пользователей")

interface UserListProps {
  users: UserCardProps[]; // теперь передаём массив объектов пользователей
  emptyMessage?: string;
}

// TODO: Типизируйте компонент UserList
function UserList({ users, emptyMessage = 'Нет пользователей' }: UserListProps) {
  if (!users.length) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className="user-list">
      {users.map((user, index) => (
        <UserCard
          key={index}
          name={user.name}
          email={user.email}
          age={user.age}
          avatar={user.avatar}
          isOnline={user.isOnline}
        />
      ))}
    </div>
  );
}
 
// ===== ЗАДАЧА 1.4: Карточка с children =====

// TODO: Создайте интерфейс CardProps со следующими свойствами:
// - title: string
// - children: React.ReactNode
// - footer: React.ReactNode (опциональное)
// - className: string (опциональное)

interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// TODO: Типизируйте компонент Card
function Card({ title, children, footer, className }: CardProps) {
  return (
    <div className={`card ${className ? className : ''}`}>
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// ===== ЗАДАЧА 1.5: Демо компонент =====

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isOnline: boolean;
}

// TODO: Типизируйте компонент App
function App() {
  const users: User[] = [
    { id: 1, name: 'Анна Иванова', email: 'anna@example.com', age: 28, isOnline: true },
    { id: 2, name: 'Петр Петров', email: 'petr@example.com', age: 35, isOnline: false },
    { id: 3, name: 'Мария Сидорова', email: 'maria@example.com', age: 24, isOnline: true }
  ];

const userCards: UserCardProps[] = users.map((user) => ({
    name: user.name,
    email: user.email,
    age: user.age,
    isOnline: user.isOnline,
    avatar: undefined, // можно добавить URL при необходимости
  }));

  const handleButtonClick = () => {
    console.log('Кнопка нажата!');
  };

  return (
    <div className="app">
      <Card title="Список пользователей" footer={<p>Всего пользователей: {users.length}</p>}>
        <UserList users={userCards} emptyMessage="Пользователей не найдено" />

        <div style={{ marginTop: '20px' }}>
          <Button variant="primary" size="medium" onClick={handleButtonClick}>
            Добавить пользователя
          </Button>
        </div>
      </Card>
    </div>
  );
}
export default App;

// ===== БОНУСНЫЕ ЗАДАЧИ =====

// TODO BONUS 1: Примените utility типы для типизации параметров компонента
// TODO BONUS 2: Создайте generic компонент List<T> с render prop паттерном
// TODO BONUS 3: Добавьте поддержку ref forwarding в Button компонент