/**
 * Задание 4: Современные паттерны React + TypeScript
 *
 * Цель: Освоить современные паттерны: Context + hooks, Custom hooks, Compound Components
 *
 * Инструкции:
 * 1. Создайте типизированные Context и хуки
 * 2. Реализуйте простые Compound Components
 * 3. Создайте custom hooks для переиспользования
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode
} from 'react';

// ===== ЗАДАЧА 4.1: Типизированные Context и хуки =====

// Определите интерфейс User
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// Определите тип для UserContext
interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

// Создайте типизированный Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Типизируйте UserProvider
const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((userData: User) => {
    // реализуйте логику входа
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    // реализуйте логику выхода
    setUser(null);
  }, []);

  const isLoggedIn = user !== null;

  const value: UserContextType = {
    user,
    login,
    logout,
    isLoggedIn
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Создайте кастомный хук useUser
function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}

// ===== ЗАДАЧА 4.2: Простые Compound Components =====

// Определите интерфейсы для Card
interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
}

interface CardContentProps {
  children: ReactNode;
}

interface CardFooterProps {
  children: ReactNode;
}

// Реализуйте основной компонент Card
const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Content: React.FC<CardContentProps>;
  Footer: React.FC<CardFooterProps>;
} = ({ children, className }) => {
  return (
    <div className={`card ${className || ''}`}>
      {children}
    </div>
  );
};

// Реализуйте Card.Header
const CardHeader: React.FC<CardHeaderProps> = ({ children }) => {
  return <div className="card-header">{children}</div>;
};

// Реализуйте Card.Content
const CardContent: React.FC<CardContentProps> = ({ children }) => {
  return <div className="card-content">{children}</div>;
};

// Реализуйте Card.Footer
const CardFooter: React.FC<CardFooterProps> = ({ children }) => {
  return <div className="card-footer">{children}</div>;
};

// Присоедините compound components к Card
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

// ===== ЗАДАЧА 4.3: Custom Hooks =====

// Создайте custom hook useCounter
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);


  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

// Создайте custom hook useToggle
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);


  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  return [value, toggle] as const;
}


// ===== ЗАДАЧА 4.4: Пример демо приложения =====

// Создайте демо компонент с использованием всех паттернов
const Demo: React.FC = () => {
  const { user, login, logout, isLoggedIn } = useUser();
  const { count, increment, decrement, reset } = useCounter(0);
  const [isVisible, toggleVisible] = useToggle(false);

  return (
    <div className="demo">
      <h1>Демо приложение</h1>

      {/* Пример Context + hooks */}
      <div className="user-section">
        <h2>Пользователь</h2>
        {isLoggedIn ? (
          <div>
            <p>Привет, {user?.name}!</p>
            <button onClick={logout}>Выйти</button>
          </div>
        ) : (
          <button
            onClick={() => login({
              id: 1,
              name: 'Иван Иванов',
              email: 'ivan@example.com',
              role: 'user'
            })}
          >
            Войти
          </button>
        )}
      </div>

      {/* Пример custom hooks */}
      <div className="counter-section">
        <h2>Счетчик: {count}</h2>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Сброс</button>
      </div>

      {/* Пример compound components */}
      <div className="card-section">
        <Card className="demo-card">
          <Card.Header>
            <h3>Пример карточки</h3>
            <button onClick={() => toggleVisible()}>
              {isVisible ? 'Скрыть' : 'Показать'}
            </button>
          </Card.Header>
          <Card.Content>
            {isVisible && (
              <p>Содержимое карточки стало видимым!</p>
            )}
          </Card.Content>
          <Card.Footer>
            <small>Подвал карточки</small>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
};

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====

// Типизируйте App компонент
const App: React.FC = () => {
  return (
    <UserProvider>
      <div className="app">
        <Demo />
      </div>
    </UserProvider>
  );
};

export default App;

// ===== БОНУСНЫЕ ЗАДАЧИ =====

// TODO BONUS 1: Добавьте Theme Context с переключением светлой/темной темы
// TODO BONUS 2: Создайте useLocalStorage hook для сохранения данных
// TODO BONUS 3: Реализуйте более сложные Compound Components (например, Tabs)