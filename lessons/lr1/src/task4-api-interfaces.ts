/*
 * ЗАДАЧА 4: Создание интерфейсов для API responses
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Создайте интерфейсы для всех API ответов
 * 3. Типизируйте все функции работы с API
 * 4. Обработайте все возможные состояния загрузки и ошибок
 */

// Система работы с API интернет-магазина

// TODO: Создать интерфейсы для API ответов:
// - ApiResponse<T>: data?, success, message?, error?
// - User: id, name, email, role, avatar?
// - Product: id, name, price, description, category, images[], rating?
// - Order: id, userId, items[], totalAmount, status, createdAt
// - OrderItem: productId, quantity, price

// TODO: Создать union типы:
// - UserRole: 'admin' | 'customer' | 'manager'
// - OrderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

/*
 * ЗАДАЧА 4: Создание интерфейсов для API responses
 * (исправленная и компилируемая версия)
 */

/*
 * ЗАДАЧА 4: Основы TypeScript
 * Выполненные TODO: интерфейсы, generics, типизация DOM.
 */

/*
 * ЗАДАЧА 4: Основы TypeScript
 * Выполненные TODO: интерфейсы, generics, типизация DOM.
 */

// ============================================
// ЧАСТЬ 1: Интерфейсы и типы
// ============================================

// TODO 1.1: Интерфейс User
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

// TODO 1.2: Тип UserRole (union)
type UserRole = 'admin' | 'user';

// TODO 1.3: Типизация функции createUser
function createUser(name: string, email: string, role: UserRole): User {
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email,
    role
  };
}

// ============================================
// ЧАСТЬ 2: Generics
// ============================================

// TODO 2.1: Типизация функции getFirst
function getFirst<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

// TODO 2.2: Типизация функции filterArray
function filterArray<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

// ============================================
// ЧАСТЬ 3: API и обработка данных
// ============================================

// TODO 3.1: Интерфейс ApiResponse
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// TODO 3.2: Типизация функции fetchUser
async function fetchUser(userId: number): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data: User = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: 'Ошибка загрузки'
      };
    }

    return {
      success: true,
      data,
      error: null
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

// ============================================
// ЧАСТЬ 4: DOM API
// ============================================

// TODO 4.1: Типизация функции getElementById
function getElementById<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element ${id} not found`);
  }
  return element as T;
}

// TODO 4.2: Типизация класса FormManager
class FormManager {
  private form: HTMLFormElement;

  constructor(formId: string) {
    this.form = getElementById<HTMLFormElement>(formId);
  }

  getValue(fieldId: string): string {
    const field = getElementById<HTMLInputElement>(fieldId);
    return field.value;
  }

  setValue(fieldId: string, value: string): void {
    const field = getElementById<HTMLInputElement>(fieldId);
    field.value = value;
  }

  onSubmit(handler: (event: SubmitEvent) => void): void {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      handler(event);
    });
  }
}

// ============================================
// Примеры использования
// ============================================

console.log('=== Тестирование ===');

// Пример 1: Создание пользователя
const user = createUser('Анна', 'anna@example.com', 'admin');
console.log('Создан пользователь:', user);

// Пример 2: Работа с массивами
const numbers = [1, 2, 3, 4, 5];
const first = getFirst(numbers);
const evens = filterArray(numbers, (n) => n % 2 === 0);
console.log('Первый элемент:', first);
console.log('Четные числа:', evens);

// Пример 3: Работа с API
// await fetchUser(1).then(response => {
//     if (response.success) {
//         console.log('Пользователь:', response.data);
//     } else {
//         console.error('Ошибка:', response.error);
//     }
// });

// Пример 4: Работа с формой (требует HTML)
// const formManager = new FormManager('my-form');
// formManager.onSubmit((event) => {
//     const name = formManager.getValue('name');
//     console.log('Отправлено:', name);
// });
