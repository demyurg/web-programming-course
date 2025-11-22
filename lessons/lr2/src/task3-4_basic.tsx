import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  FormEvent,
  ChangeEvent,
} from "react";

// TODO 1.1
interface FormData {
  name: string;
  email: string;
  message: string;
}

// TODO 1.2 + 1.3
const SimpleForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // TODO 1.4
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // TODO 1.5
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Форма отправлена:", formData);

    setSubmitted(true);

    // Автоматически скрываем сообщение через 3 секунды
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="simple-form">
      <h2>Форма обратной связи</h2>

      {submitted && (
        <div className="success-message">✅ Форма отправлена успешно!</div>
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
            placeholder="Ваше имя"
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
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Сообщение:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            required
            placeholder="Ваше сообщение..."
          />
        </div>

        <button type="submit" className="submit-btn">
          Отправить
        </button>
      </form>
    </div>
  );
};

// TODO 2.1
interface User {
  id: number;
  name: string;
  email: string;
}

// TODO 2.2
interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

// TODO 2.3
const UserContext = createContext<UserContextType | undefined>(undefined);

// TODO 2.4
const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
};

// TODO 2.5
function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser должен использоваться внутри UserProvider");
  }
  return context;
}

// TODO 2.6
const UserStatus: React.FC = () => {
  const { user, logout } = useUser();

  if (!user) {
    return <span className="user-status-guest">Гость</span>;
  }

  return (
    <div className="user-status">
      <span>👤 Привет, {user.name}!</span>
      <button onClick={logout} className="logout-btn">
        Выйти
      </button>
    </div>
  );
};

// TODO 2.7
const Profile: React.FC = () => {
  const { user, login } = useUser();

  const handleLogin = () => {
    login({
      id: 1,
      name: "Иван Иванов",
      email: "ivan@example.com",
    });
  };

  if (!user) {
    return (
      <div className="profile guest">
        <h2>Добро пожаловать!</h2>
        <p>Вы не авторизованы</p>
        <button onClick={handleLogin} className="login-btn">
          Войти как Иван Иванов
        </button>
      </div>
    );
  }

  return (
    <div className="profile logged-in">
      <h2>Профиль пользователя</h2>
      <div className="profile-info">
        <p>
          <strong>Имя:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
      </div>
    </div>
  );
};

function AppContent() {
  const [activeTab, setActiveTab] = useState<"form" | "profile">("form");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Приложение с формами и авторизацией</h1>
        {/* TODO 2.8 */}
        <UserStatus />
      </header>

      <nav className="tabs">
        <button
          className={activeTab === "form" ? "active" : ""}
          onClick={() => setActiveTab("form")}
        >
          Форма
        </button>
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Профиль
        </button>
      </nav>

      <main className="content">
        {activeTab === "form" && <SimpleForm />}
        {activeTab === "profile" && <Profile />}
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
