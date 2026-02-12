// ============================================
// ЧАСТЬ 1: Интерфейсы и типы (5-10 минут)
// ============================================

// Интерфейс usera
interface usera {
    id: number;
    name: string;
    email: string;
    role: UserRole; // Используем созданный позже тип UserRole
}

// Union type для роли пользователя
type UserRole = 'admin' | 'user';

// Типизируем функцию создания пользователя
function createUsera(name: string, email: string, role: UserRole): usera {
    return {
        id: Math.floor(Math.random() * 1000),
        name: name,
        email: email,
        role: role
    };
}

// ============================================
// ЧАСТЬ 2: Generics
// ============================================

// Generic-функция для извлечения первого элемента массива
function getFirst<T>(array: T[]): T | undefined {
    return array.length > 0 ? array[0] : undefined;
}

// Generic-функция для фильтрации массива
function filterArray<T>(array: T[], predicate: (item: T) => boolean): T[] {
    return array.filter(predicate);
}

// ============================================
// ЧАСТЬ 3: API и обработка данных
// ============================================

// Интерфейс для ответа API
interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error: string | null;
}

// Типизируем функцию получения пользователя
async function fetchUser(userId: number): Promise<ApiResponse<usera>> {
    try {
        const response = await fetch(`/api/users/${userId}`); // Исправил обратные слэши на прямые
        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                data: null,
                error: 'Ошибка загрузки'
            };
        }

        return {
            success: true,
            data: data,
            error: null
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            error: (error as Error).message // Привели error к типу Error
        };
    }
}
// ============================================
// ЧАСТЬ 4: DOM API (10-15 минут)
// ============================================

// Типизируем получение элемента по ID
function getElementById<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element ${id} not found`);
    }
    return element as T;
}

// Менеджер формы с типизацией
class FormManager {
    form: HTMLFormElement;

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

    onSubmit(handler: (event: Event) => void): void {
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
const usera = createUsera('Анна', 'anna@example.com', 'admin');
console.log('Создан пользователь:', usera);

// Пример 2: Работа с массивами
const numbers = [1, 2, 3, 4, 5];
const first = getFirst(numbers);
const evens = filterArray(numbers, n => n % 2 === 0);
console.log('Первый элемент:', first);
console.log('Четные числа:', evens);