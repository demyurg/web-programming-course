// TODO 1.1
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole; // используем наш union тип
}

// TODO 1.2
type UserRole = "admin" | "user";

// TODO 1.3 — типизированная функция создания пользователя
function createUser(
  name: string,
  email: string,
  role: UserRole = "user"
): User {
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email,
    role,
  };
}

// TODO 2.1 — generic функция для получения первого элемента
function getFirst<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

// TODO 2.2 — generic фильтрация массива
function filterArray<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

// TODO 3.1 — generic интерфейс для ответа API
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// TODO 3.2 — типизированная async функция
async function fetchUser(userId: number): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: "Ошибка загрузки",
      };
    }

    // TypeScript теперь знает, что data — это User
    return {
      success: true,
      data: data as User,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message ?? "Неизвестная ошибка",
    };
  }
}

// TODO 4.1 — типизированная функция с возвратом HTMLElement
function getElementById(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element;
}

// TODO 4.2 — типизированный класс FormManager
class FormManager {
  private form: HTMLFormElement;

  constructor(formId: string) {
    this.form = getElementById(formId) as HTMLFormElement;
  }

  getValue(fieldId: string): string {
    const field = getElementById(fieldId) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    return field.value;
  }

  setValue(fieldId: string, value: string): void {
    const field = getElementById(fieldId) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    field.value = value;
  }

  onSubmit(handler: (event: SubmitEvent) => void): void {
    this.form.addEventListener("submit", (event: Event) => {
      event.preventDefault();
      handler(event as SubmitEvent);
    });
  }
}

console.log("=== Тестирование ===");

// Пример 1
const user = createUser("Анна", "anna@example.com", "admin");
console.log("Создан пользователь:", user);

// Пример 2
const numbers = [1, 2, 3, 4, 5];
const first = getFirst(numbers); // number | undefined
const evens = filterArray(numbers, (n) => n % 2 === 0); // number[]
console.log("Первый элемент:", first);
console.log("Чётные числа:", evens);

// Пример 3
fetchUser(1).then((response) => {
  if (response.success && response.data) {
    console.log("Пользователь:", response.data.name);
  } else {
    console.error("Ошибка:", response.error);
  }
});

// Пример 4 — работает в браузере с HTML формой
const formManager = new FormManager("my-form");
formManager.onSubmit(() => {
  const name = formManager.getValue("name-input");
  console.log("Отправлено имя:", name);
});
