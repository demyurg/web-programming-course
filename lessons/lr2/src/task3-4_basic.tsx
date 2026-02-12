/**
 * ЗАДАНИЕ 3-4: Формы и Context
 *
 * Упрощенное задание, объединяющее формы и Context API
 *
 * Что будем изучать:
 * - Типизация форм и событий
 * - Context API
 * - Custom hooks
 */

import React, { createContext, useContext, useState, ReactNode, ChangeEvent, FormEvent } from 'react';

// ============================================
// ЧАСТЬ 1: Простая форма
// ============================================

// 1.1: Интерфейс данных формы
interface FormData {
  name: string;
  email: string;
  message: string;
}

// 1.2: Компонент SimpleForm
function SimpleForm() {
  // 1.3: Состояние формы
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  // 1.4: Обработчик изменений
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 1.5: Обработчик отправки
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Отправлено:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="simple-form">
      <h2>Форма обратной связи</h2>

      {submitted && <div className="success">Форма отправлена успешно!</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Имя:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Сообщение:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <button type="submit">Отправить</button>
      </form>
    </div>
  );
}

// ============================================
// ЧАСТЬ 2: Context API
// ============================================

//2.1: Интерфейс пользователя
interface User {
  id: number;
  name: string;
  email: string;
}

// 2.2: Тип контекста
interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

// 2.3: Создание контекста
const UserContext = createContext<UserContextType | undefined>(undefined);

// 2.4: Провайдер контекста
function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// 2.5: Кастомный хук useUser
function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser должен использоваться внутри UserProvider');
  }
  return context;
}

// 2.6: Компонент статуса пользователя
function UserStatus() {
  const { user, logout } = useUser();

  if (!user) {
    return <span>Не авторизован</span>;
  }

  return (
    <div className="user-status">
      <span>Привет, {user.name}!</span>
      <button onClick={logout}>Выйти</button>
    </div>
  );
}

// 2.7: Компонент профиля
function Profile() {
  const { user, login } = useUser();

  const handleLogin = () => {
    login({
      id: 1,
      name: 'Иван Иванов',
      email: 'ivan@example.com',
    });
  };

  if (!user) {
    return (
      <div className="profile">
        <h2>Вы не авторизованы</h2>
        <button onClick={handleLogin}>Войти</button>
      </div>
    );
  }

  return (
    <div className="profile">
      <h2>Профиль</h2>
      <p>Имя: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}

// ============================================
// Главный компонент
// ============================================

function AppContent() {
  const [activeTab, setActiveTab] = useState<'form' | 'profile'>('form');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Приложение с формами и авторизацией</h1>
        {/*  2.8: Добавляем компонент статуса пользователя */}
        <UserStatus />
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'form' ? 'active' : ''}
          onClick={() => setActiveTab('form')}
        >
          Форма
        </button>
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Профиль
        </button>
      </nav>

      <div className="content">
        {activeTab === 'form' && <SimpleForm />}
        {activeTab === 'profile' && <Profile />}
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;




