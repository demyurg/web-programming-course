/**
 * Задание 3: Основы типизации форм и событий
 *
 * Цель: Научиться типизировать form события и создавать контролируемые компоненты
 *
 * Инструкции:
 * 1. Типизируйте event handlers
 * 2. Создайте простую валидацию
 * 3. Работайте с контролируемыми формами
 */

import { useState, ChangeEvent, FormEvent } from 'react';

// ===== ЗАДАЧА 3.1: Простая форма пользователя =====

// TODO: Определите интерфейс UserFormData
interface UserFormData {
  name: string;
  email: string;
  age: number;
  message: string;
}

// TODO: Определите интерфейс FormErrors
interface FormErrors {
  name?: string;
  email?: string;
  age?: string;
  message?: string;
}

// TODO: Типизируйте компонент UserForm
function UserForm() {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    age: 0,
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // TODO: Создайте простую валидацию
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.email.trim()) newErrors.email = 'Email обязателен';
    else if (!formData.email.includes('@')) newErrors.email = 'Некорректный email';
    if (formData.age <= 0) newErrors.age = 'Возраст должен быть больше 0';
    if (!formData.message.trim()) newErrors.message = 'Введите сообщение';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // TODO: Типизируйте обработчик изменения инпутов
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value,
    }));

    // Очистить ошибку для поля
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // TODO: Типизируйте обработчик отправки формы
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Обработайте успешную отправку
      console.log('Form submitted:', formData);
      setSubmitStatus('success');

      // TODO: Сбросьте форму
    } catch (error) {
      // TODO: Обработайте ошибку
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-form">
      <h2>Форма пользователя</h2>

      <form onSubmit={handleSubmit}>
        {/* TODO: Имя */}
        <div className="form-group">
          <label htmlFor="name">Имя *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        {/* TODO: Email */}
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        {/* TODO: Возраст */}
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
            className={errors.age ? 'error' : ''}
          />
          {errors.age && <span className="error-message">{errors.age}</span>}
        </div>

        {/* TODO: Сообщение */}
        <div className="form-group">
          <label htmlFor="message">Сообщение *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            disabled={isSubmitting}
            rows={4}
            className={errors.message ? 'error' : ''}
          />
          {errors.message && <span className="error-message">{errors.message}</span>}
        </div>

        {/* Кнопка отправки */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'Отправить'}
        </button>

        {/* Статус отправки */}
        {submitStatus === 'success' && (
          <div className="success-message">Форма отправлена успешно!</div>
        )}
        {submitStatus === 'error' && (
          <div className="error-message">Произошла ошибка при отправке</div>
        )}
      </form>
    </div>
  );
}

// ===== ЗАДАЧА 3.2: Простая форма поиска =====

// TODO: Определите интерфейс SearchData
interface SearchData {
  query: string;
  category: 'all' | 'tech' | 'design';
}

// TODO: Типизируйте компонент SearchForm
function SearchForm() {
  const [searchData, setSearchData] = useState<SearchData>({
    query: '',
    category: 'all',
  });

  // TODO: Типизируйте обработчик изменения поискового запроса
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // TODO: обновите searchData
     setSearchData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // TODO: Типизируйте обработчик отправки поиска
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: выполните поиск
    console.log('Поиск:', searchData);
  };

  return (
    <div className="search-form">
      <h2>Поиск</h2>

      <form onSubmit={handleSearch}>
        {/* TODO: Поисковый запрос */}
        <div className="form-group">
          <label htmlFor="query">Поиск</label>
          <input
            type="text"
            id="query"
            name="query"
            value={searchData.query}
            onChange={handleInputChange}
            placeholder="Введите запрос..."
          />
        </div>

        {/* TODO: Категория */}
        <div className="form-group">
          <label htmlFor="category">Категория</label>
          <select
            id="category"
            name="category"
            value={searchData.category}
            onChange={handleInputChange}
          >
            <option value="all">Все</option>
            <option value="tech">Технологии</option>
            <option value="design">Дизайн</option>
          </select>
        </div>

        {/* Кнопка поиска */}
        <button type="submit">
          Поиск
        </button>
      </form>

      {/* TODO: Отобразите результаты поиска */}
      <div className="search-results">
        <pre>{JSON.stringify(searchData, null, 2)}</pre>
      </div>
    </div>
  );
}


// ===== ГЛАВНЫЙ КОМПОНЕНТ =====

// TODO: Типизируйте компонент App
function App() {
  const [activeForm, setActiveForm] = useState<'user' | 'search'>('user');

  return (
    <div className="app">
      <nav className="form-nav">
        <button
          className={activeForm === 'user' ? 'active' : ''}
          onClick={() => setActiveForm('user')}
        >
          Форма пользователя
        </button>
        <button
          className={activeForm === 'search' ? 'active' : ''}
          onClick={() => setActiveForm('search')}
        >
          Поиск
        </button>
      </nav>

      <div className="form-content">
        {activeForm === 'user' && <UserForm />}
        {activeForm === 'search' && <SearchForm />}
      </div>
    </div>
  );
}

export default App;

// ===== БОНУСНЫЕ ЗАДАЧИ =====

// TODO BONUS 1: Создайте real-time валидацию с debouncing
// TODO BONUS 2: Добавьте комплексные фильтры в поиск
// TODO BONUS 3: Создайте универсальный хук useForm