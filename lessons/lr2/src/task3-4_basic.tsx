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


interface FormData {
  name: string;
  email: string;
  message: string;
}


function SimpleForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const { login } = useUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Отправлено:', formData);
    // Логиним пользователя по данным формы
    login({
      id: Date.now(),
      name: formData.name,
      email: formData.email,
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="simple-form">
      <h2>Форма обратной связи</h2>

      {submitted && (
        <div className="success">Форма отправлена успешно!</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* TODO: Поле имени */}
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

        {/* TODO: Поле email */}
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

        {/* TODO: Поле сообщения */}
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


interface User {
  id: number;
  name: string;
  email: string;
}


interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);


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


function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser должен использоваться внутри UserProvider');
  }
  return context;
}


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

// TODO 2.7: Создайте компонент Profile
function Profile() {
  const { user, login } = useUser();

  const handleLogin = () => {
    login({
      id: 1,
      name: 'Иван Иванов',
      email: 'ivan@example.com'
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