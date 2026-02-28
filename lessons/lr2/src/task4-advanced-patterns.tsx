import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value: UserContextType = {
    user,
    login,
    logout,
    isLoggedIn: user !== null,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardSubComponents {
  Header: React.FC<CardHeaderProps>;
  Content: React.FC<CardContentProps>;
  Footer: React.FC<CardFooterProps>;
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

const Card: React.FC<CardProps> & CardSubComponents = ({
  children,
  className = "",
}) => {
  return <div className={`card ${className}`.trim()}>{children}</div>;
};

const CardHeader: React.FC<CardHeaderProps> = ({ children }) => (
  <div className="card-header">{children}</div>
);

const CardContent: React.FC<CardContentProps> = ({ children }) => (
  <div className="card-content">{children}</div>
);

const CardFooter: React.FC<CardFooterProps> = ({ children }) => (
  <div className="card-footer">{children}</div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}

function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle];
}

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("useLocalStorage error:", error);
    }
  };

  return [storedValue, setValue];
}

interface TabsProps {
  children: ReactNode;
  defaultTab?: string;
}

interface TabListProps {
  children: ReactNode;
}

interface TabProps {
  id: string;
  children: ReactNode;
}

interface TabPanelProps {
  tabId: string;
  children: ReactNode;
}

const TabsContext = createContext<
  { activeTab: string; setActiveTab: (id: string) => void } | undefined
>(undefined);

const Tabs: React.FC<TabsProps> & {
  List: React.FC<TabListProps>;
  Tab: React.FC<TabProps>;
  Panel: React.FC<TabPanelProps>;
} = ({ children, defaultTab = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || "");

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

const TabList: React.FC<TabListProps> = ({ children }) => (
  <div className="tab-list">{children}</div>
);

const Tab: React.FC<TabProps> = ({ id, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tab must be used within Tabs");

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === id || (!activeTab && id === "1");

  
  return (
    <button
      className={`tab ${isActive ? "active" : ""}`}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
};

const TabPanel: React.FC<TabPanelProps> = ({ tabId, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabPanel must be used within Tabs");

  const { activeTab } = context;
  const isActive = activeTab === tabId;

  if (!isActive) return null;

  return <div className="tab-panel">{children}</div>;
};

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

const Demo: React.FC = () => {
  const { user, login, logout, isLoggedIn } = useUser();
  const { count, increment, decrement, reset } = useCounter(0);
  const [isVisible, toggleVisible] = useToggle(false);
  const { theme, toggleTheme } = useTheme();
  const [savedName, setSavedName] = useLocalStorage("demo-name", "Гость");

  return (
    <div className="demo">
      <h1>Современные паттерны React + TS</h1>

      {/* User Context */}
      <Card className="section">
        <Card.Header>
          <h2>Авторизация</h2>
        </Card.Header>
        <Card.Content>
          {isLoggedIn ? (
            <p>
              Привет, {user!.name}! ({user!.role})
            </p>
          ) : (
            <p>Вы не авторизованы</p>
          )}
          <button
            onClick={() =>
              isLoggedIn
                ? logout()
                : login({
                    id: 1,
                    name: "Иван Иванов",
                    email: "ivan@example.com",
                    role: "admin",
                  })
            }
          >
            {isLoggedIn ? "Выйти" : "Войти как админ"}
          </button>
        </Card.Content>
      </Card>

      {/* Custom Hooks */}
      <Card className="section">
        <Card.Header>
          <h2>Счетчик: {count}</h2>
        </Card.Header>
        <Card.Content>
          <button onClick={increment}>+</button>
          <button onClick={decrement}>-</button>
          <button onClick={reset}>Сброс</button>
        </Card.Content>
      </Card>

      {/* Toggle */}
      <Card className="section">
        <Card.Header>
          <h2>Переключатель</h2>
          <button onClick={toggleVisible}>
            {isVisible ? "Скрыть" : "Показать"} содержимое
          </button>
        </Card.Header>
        {isVisible && <Card.Content>Секретное содержимое!</Card.Content>}
      </Card>

      {/* Theme + LocalStorage */}
      <Card className="section">
        <Card.Header>
          <h2>Тема: {theme.toUpperCase()}</h2>
          <button onClick={toggleTheme}>Переключить тему</button>
        </Card.Header>
        <Card.Content>
          <p>Привет, {savedName}!</p>
          <input
            value={savedName}
            onChange={(e) => setSavedName(e.target.value)}
            placeholder="Введите имя"
          />
        </Card.Content>
      </Card>

      {/* Tabs Bonus */}
      <Tabs defaultTab="1">
        <Tabs.List>
          <Tabs.Tab id="1">Вкладка 1</Tabs.Tab>
          <Tabs.Tab id="2">Вкладка 2</Tabs.Tab>
          <Tabs.Tab id="3">Вкладка 3</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel tabId="1">
          <Card>
            <Card.Content>Содержимое первой вкладки</Card.Content>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel tabId="2">
          <Card>
            <Card.Content>Вторая вкладка с контентом</Card.Content>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel tabId="3">
          <Card>
            <Card.Content>Третья — лучшая!</Card.Content>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <div className="app" data-theme="light">
          <Demo />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
