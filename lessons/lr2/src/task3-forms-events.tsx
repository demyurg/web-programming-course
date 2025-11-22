import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";

interface UserFormData {
  name: string;
  email: string;
  age: number;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  age?: string;
  message?: string;
}

const UserForm: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    age: 18,
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
    }

    if (!formData.email.includes("@")) {
      newErrors.email = "Введите корректный email";
    }

    if (formData.age <= 0) {
      newErrors.age = "Возраст должен быть больше 0";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Сообщение обязательно";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "age") {
      setFormData((prev) => ({ ...prev, age: Number(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Очищаем ошибку при вводе
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Форма успешно отправлена:", formData);
      setSubmitStatus("success");

      setFormData({ name: "", email: "", age: 18, message: "" });
    } catch (error) {
      console.error("Ошибка отправки:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-form">
      <h2>Регистрация пользователя</h2>

      {submitStatus === "success" && (
        <div className="success-message">✅ Форма успешно отправлена!</div>
      )}
      {submitStatus === "error" && (
        <div className="error-message">❌ Произошла ошибка при отправке</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Имя *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.name ? "error" : ""}
            placeholder="Иван Иванов"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.email ? "error" : ""}
            placeholder="ivan@example.com"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="age">Возраст *</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            disabled={isSubmitting}
            min="1"
            className={errors.age ? "error" : ""}
          />
          {errors.age && <span className="error-text">{errors.age}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message">Сообщение *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            disabled={isSubmitting}
            rows={5}
            className={errors.message ? "error" : ""}
            placeholder="Расскажите о себе..."
          />
          {errors.message && (
            <span className="error-text">{errors.message}</span>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? "Отправка..." : "Отправить"}
        </button>
      </form>
    </div>
  );
};

interface SearchData {
  query: string;
  category: "all" | "tech" | "design";
}

const SearchForm: React.FC = () => {
  const [searchData, setSearchData] = useState<SearchData>({
    query: "",
    category: "all",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Выполняется поиск:", searchData);
    alert(`Поиск: "${searchData.query}" в категории "${searchData.category}"`);
  };

  return (
    <div className="search-form">
      <h2>Поиск по сайту</h2>

      <form onSubmit={handleSearch}>
        <div className="form-group">
          <label htmlFor="query">Запрос</label>
          <input
            type="text"
            id="query"
            name="query"
            value={searchData.query}
            onChange={handleInputChange}
            placeholder="Введите запрос..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Категория</label>
          <select
            id="category"
            name="category"
            value={searchData.category}
            onChange={handleInputChange}
          >
            <option value="all">Все категории</option>
            <option value="tech">Технологии</option>
            <option value="design">Дизайн</option>
          </select>
        </div>

        <button type="submit" className="search-btn">
          🔍 Найти
        </button>
      </form>

      <div className="search-results">
        <h3>Текущие параметры поиска:</h3>
        <pre>{JSON.stringify(searchData, null, 2)}</pre>
      </div>
    </div>
  );
};

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  debounceMs?: number;
}

function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  debounceMs = 300,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!validate || !isDirty) return;

    const timer = setTimeout(() => {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [values, validate, isDirty, debounceMs]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return {
    values,
    errors,
    handleChange,
    setValues,
    reset: () => setValues(initialValues),
  };
}

const BonusForm: React.FC = () => {
  const { values, errors, handleChange } = useForm({
    initialValues: { username: "", password: "" },
    validate: (values) => {
      const errs: any = {};
      if (!values.username) errs.username = "Логин обязателен";
      if (values.password.length < 6) errs.password = "Минимум 6 символов";
      return errs;
    },
  });

  return (
    <div className="bonus-form">
      <h3>Бонус: useForm с debouncing</h3>
      <input
        name="username"
        value={values.username}
        onChange={handleChange}
        placeholder="Логин"
      />
      {errors.username && <span className="error-text">{errors.username}</span>}
      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        placeholder="Пароль"
      />
      {errors.password && <span className="error-text">{errors.password}</span>}
    </div>
  );
};

type ActiveForm = "user" | "search";

const App: React.FC = () => {
  const [activeForm, setActiveForm] = useState<ActiveForm>("user");

  return (
    <div className="app">
      <h1>Задание 3: Формы и события</h1>

      <nav className="form-nav">
        <button
          className={activeForm === "user" ? "active" : ""}
          onClick={() => setActiveForm("user")}
        >
          Форма пользователя
        </button>
        <button
          className={activeForm === "search" ? "active" : ""}
          onClick={() => setActiveForm("search")}
        >
          Поиск
        </button>
      </nav>

      <main className="form-content">
        {activeForm === "user" && (
          <>
            <UserForm />
            <BonusForm />
          </>
        )}
        {activeForm === "search" && <SearchForm />}
      </main>
    </div>
  );
};

export default App;
