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

// TODO: Типизируйте компонент UserCard
interface UserCardProps {
  name: string;
  email: string;
  age?: number;
  avatar?: string;
  isOnline: boolean;
}


function UserCard({ name, email, age, avatar, isOnline }: UserCardProps) {
  return (
    <div className="user-card">
      {avatar && <img src={avatar} alt="Avatar" />} {/* Отображаем avatar, если он есть */}
      <h2>{name}</h2> {/* Отображаем name */}
      <p>{email}</p> {/* Отображаем email */}
      {age && <p>Возраст: {age}</p>} {/* Отображаем age, если он есть */}
      <span className={`status ${isOnline ? 'online' : 'offline'}`}> {/* Класс на основе isOnline */}
        {isOnline ? 'Онлайн' : 'Офлайн'} {/* Статус онлайн/офлайн */}
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
  disabled?: boolean; // Опциональное, по умолчанию false
  onClick: () => void;
}
// TODO: Типизируйте компонент Button
function Button(props: ButtonProps) {
  return (
    <button
      className={`btn btn--${props.variant} btn--${props.size}`}
      disabled={props.disabled ?? false}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

// ===== ЗАДАЧА 1.3: Простой список пользователей =====

// TODO: Создайте интерфейс UserListProps со следующими свойствами:
// - users: string[] (массив имен пользователей)
// - emptyMessage: string (опциональное, по умолчанию "Нет пользователей")


interface UserListProps {
  users: string[];
  emptyMessage?: string; // Опциональное, по умолчанию "Нет пользователей"
}

// TODO: Типизируйте компонент UserList
function UserList(props: UserListProps) {
  if (props.users.length === 0) {
    return <p>{props.emptyMessage ?? 'Нет пользователей'}</p>; // Если users пустой, отображаем emptyMessage с дефолтом
  }

  return (
    <ul className="user-list">
      {props.users.map((user, index) => (
        <li key={index}>{user}</li> // Рендерим users как <li> элементы
      ))}
    </ul>
  );
}

// ===== ЗАДАЧА 1.4: Карточка с children =====

// TODO: Создайте интерфейс CardProps со следующими свойствами:
// - title: string
// - children: React.ReactNode
// - footer: React.ReactNode (опциональное)
// - className: string (опциональное)

// TODO: Типизируйте компонент Card
interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // Опциональное
  className?: string; // Опциональное
}


function Card(props: CardProps) {
  return (
    <div className={`card ${props.className ?? ''}`.trim()}> {/* Добавляем className, если есть */}
      <div className="card-header">
        <h3>{props.title}</h3> {/* Отображаем title */}
      </div>
      <div className="card-content">
        {props.children} {/* Отображаем children */}
      </div>
      {props.footer && <div className="card-footer">{props.footer}</div>} {/* Отображаем footer, если есть */}
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
function App(): React.ReactElement {
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
}

export default App;


// ===== БОНУСНЫЕ ЗАДАЧИ =====

// TODO BONUS 1: Примените utility типы для типизации параметров компонента
// TODO BONUS 2: Создайте generic компонент List<T> с render prop паттерном
// TODO BONUS 3: Добавьте поддержку ref forwarding в Button компонент