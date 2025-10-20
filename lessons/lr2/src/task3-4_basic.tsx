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

import React, { createContext, useContext, useState, ReactNode } from 'react';

// ============================================
// ЧАСТЬ 1: Простая форма
// ============================================

// TODO 1.1: Интерфейс FormData
interface FormData {
  name: string;
  email: string;
  message: string;
}

// TODO 1.2: Типизация компонента SimpleForm
function SimpleForm(): JSX.Element {
  // TODO 1.3: Состояние formData
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  // TODO 1.4: Обработчик изменения
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prevState => ({ ...prevState, [name]: value }));
  };
  // TODO 1.5: Обработчик отправки
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Отправлено:', formData);

    setSubmitted(true); // Устанавливаем флаг успешной отправки

    setTimeout(() => setSubmitted(false), 3000); // Через три секунды сбрасываем этот флаг обратно
  };

  return (
    <div className="simple-form">
      <h2>Форма обратной связи</h2>

      {submitted && (
        <div className="success">Форма отправлена успешно!</div>
      )}

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

// TODO 2.1: Интерфейс User
interface User {
  id: number;
  name: string;
  email: string;
}

// TODO 2.2: Интерфейс UserContextType
interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

// TODO 2.3: Контекст UserContext
const UserContext = createContext<UserContextType | undefined>(undefined);

// TODO 2.4: Типизация UserProvider
function UserProvider({ children }: { children: ReactNode }): JSX.Element {
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

// TODO 2.5: Custom Hook useUser
function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}

// TODO 2.6: Компонент UserStatus
function UserStatus() {
  const { user, logout } = useUser(); // Получаем данные пользователя и функцию выхода

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

// ============================================
// Общий компонент App
// ============================================

function AppContent() {
  const [activeTab, setActiveTab] = useState<'form' | 'profile'>('form');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Приложение с формами и авторизацией</h1>
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