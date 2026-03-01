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
  ReactNode,
  useEffect
} from 'react';

// ===== ЗАДАЧА 4.1: Типизированные Context и хуки =====

// TODO: Определите интерфейс User
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// TODO: Определите тип для UserContext
interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

// TODO: Создайте типизированный Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// TODO: Типизируйте UserProvider
function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((userData: User) => {
    // TODO: реализуйте логику входа
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    // TODO: реализуйте логику выхода
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
}

// TODO: Создайте кастомный хук useUser
function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}

// ===== ЗАДАЧА 4.2: Простые Compound Components =====

// TODO: Создайте простой Card компонент с compound паттерном

// TODO: Определите интерфейсы для Card
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

// TODO: Реализуйте основной компонент Card
function Card({ children, className }: CardProps) {
  return (
    <div className={`card ${className || ''}`}>
      {children}
    </div>
  );
}

// TODO: Реализуйте Card.Header
const CardHeader = ({ children }: CardHeaderProps) => {
  return <div className="card-header">{children}</div>;
};

// TODO: Реализуйте Card.Content
const CardContent = ({ children }: CardContentProps) => {
  return <div className="card-content">{children}</div>;
};

// TODO: Реализуйте Card.Footer
const CardFooter = ({ children }: CardFooterProps) => {
  return <div className="card-footer">{children}</div>;
};

// TODO: Присоедините compound components к Card
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

// ===== ЗАДАЧА 4.3: Custom Hooks =====

// TODO: Создайте custom hook useCounter
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    // TODO: реализуйте увеличение
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    // TODO: реализуйте уменьшение
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    // TODO: реализуйте сброс
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

// TODO: Создайте custom hook useToggle
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    // TODO: реализуйте переключение
    setValue(prev => !prev);
  }, []);

  return [value, toggle] as const;
}

// ===== ЗАДАЧА 4.4: Пример демо приложения =====

// TODO: Создайте демо компонент с использованием всех паттернов
const Demo = () => {
  const { user, login, logout, isLoggedIn } = useUser();
  const { count, increment, decrement, reset } = useCounter(0);
  const [isVisible, toggleVisible] = useToggle(false);

  return (
    <div className="demo">
      <h1>Демо приложение</h1>

      {/* TODO: Пример Context + hooks */}
      <div className="user-section">
        <h2>Пользователь</h2>
        {isLoggedIn ? (
          <div>
            <p>Привет, {user?.name}!</p>
            <p>Email: {user?.email}</p>
            <p>Роль: {user?.role}</p>
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

      {/* TODO: Пример custom hooks */}
      <div className="counter-section">
        <h2>Счетчик: {count}</h2>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Сброс</button>
      </div>

      {/* TODO: Пример compound components */}
      <div className="card-section">
        <Card className="demo-card">
          <Card.Header>
            <h3>Пример карточки</h3>
            <button onClick={toggleVisible}>
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

// ===== БОНУСНЫЕ ЗАДАЧИ =====

// TODO BONUS 1: Добавьте Theme Context с переключением светлой/темной темы
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const value: ThemeContextType = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// TODO BONUS 2: Создайте useLocalStorage hook для сохранения данных
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// TODO BONUS 3: Реализуйте более сложные Compound Components (например, Tabs)
interface TabsProps {
  children: ReactNode;
  defaultValue: string;
}

interface TabsListProps {
  children: ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
}

const TabsContext = createContext<{ value: string; onValueChange: (value: string) => void } | undefined>(undefined);

function Tabs({ children, defaultValue }: TabsProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, onValueChange: setValue }}>
      <div className="tabs">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ children }: TabsListProps) {
  return <div className="tabs-list">{children}</div>;
}

function TabsTrigger({ value, children }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }

  return (
    <button
      className={`tab-trigger ${context.value === value ? 'active' : ''}`}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }

  if (context.value !== value) return null;

  return <div className="tab-content">{children}</div>;
}

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

// ===== РАСШИРЕННОЕ ДЕМО ПРИЛОЖЕНИЕ =====

const EnhancedDemo = () => {
  const { user, login, logout, isLoggedIn } = useUser();
  const { count, increment, decrement, reset } = useCounter(0);
  const [isVisible, toggleVisible] = useToggle(false);
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useLocalStorage('username', '');

  return (
    <div className={`demo ${theme}`}>
      <header className="demo-header">
        <h1>Демо приложение</h1>
        <button onClick={toggleTheme}>
          Переключить тему: {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      {/* Tabs Component Demo */}
      <div className="tabs-demo">
        <Tabs defaultValue="profile">
          <Tabs.List>
            <Tabs.Trigger value="profile">Профиль</Tabs.Trigger>
            <Tabs.Trigger value="counter">Счетчик</Tabs.Trigger>
            <Tabs.Trigger value="settings">Настройки</Tabs.Trigger>
          </Tabs.List>
          
          <Tabs.Content value="profile">
            <div className="user-section">
              <h2>Пользователь</h2>
              {isLoggedIn ? (
                <div>
                  <p>Привет, {user?.name}!</p>
                  <p>Email: {user?.email}</p>
                  <p>Роль: {user?.role}</p>
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
          </Tabs.Content>
          
          <Tabs.Content value="counter">
            <div className="counter-section">
              <h2>Счетчик: {count}</h2>
              <button onClick={increment}>+</button>
              <button onClick={decrement}>-</button>
              <button onClick={reset}>Сброс</button>
            </div>
          </Tabs.Content>
          
          <Tabs.Content value="settings">
            <div className="settings-section">
              <h2>Настройки</h2>
              <div className="form-group">
                <label>Имя пользователя (сохраняется в localStorage):</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите имя"
                />
              </div>
              <p>Текущая тема: {theme}</p>
            </div>
          </Tabs.Content>
        </Tabs>
      </div>

      {/* Card Component Demo */}
      <div className="card-section">
        <Card className="demo-card">
          <Card.Header>
            <h3>Пример карточки</h3>
            <button onClick={toggleVisible}>
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

// TODO: Типизируйте App компонент
const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <div className="app">
          <EnhancedDemo />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;