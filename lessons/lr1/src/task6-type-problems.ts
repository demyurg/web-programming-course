/*
 * ЗАДАЧА 6: Решение типовых проблем типизации
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Исправьте все проблемы с типизацией
 * 3. Используйте type guards, utility types и другие продвинутые возможности
 * 4. Добавьте proper обработку ошибок и edge cases
 */

// Проблемные функции, которые нужно исправить

// ПРОБЛЕМА 1: Функция с any типом
function processData<T>(data: T[]): string[];
function processData<T extends Record<string, any>>(data: T): string[];
function processData(data: string): string[];
function processData<T>(data: T[] | T | string): string[] {
    if (Array.isArray(data)) {
        return data.map(item => String(item));
    }

    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).map(key => `${key}: ${(data as Record<string, any>)[key]}`);
    }

    return [String(data)];
}

// ПРОБЛЕМА 2: Функция с неопределенными возвращаемыми типами
function getValue<T extends Record<string, any>, K extends keyof T>(obj: T, path: string): any {
    const keys = path.split('.');
    let current: any = obj;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }

    return current;
}

// ПРОБЛЕМА 3: Функция с проблемами null/undefined
interface UserInput {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    age?: number | null;
    avatar?: string | null;
}

interface FormattedUser {
    fullName: string;
    email: string;
    age: number | string;
    avatar: string;
}

function formatUser(user: UserInput): FormattedUser {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';

    return {
        fullName: `${firstName} ${lastName}`.trim(),
        email: user.email ? user.email.toLowerCase() : '',
        age: user.age || 'Не указан',
        avatar: user.avatar || '/default-avatar.png'
    };
}

// ПРОБЛЕМА 4: Функция с union типами без type guards
interface SuccessResponse<T> {
    success: true;
    data: T;
}

interface ErrorResponse {
    success: false;
    error: string;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

function handleResponse<T>(response: ApiResponse<T>): T | never {
    if (response.success) {
        console.log('Данные:', response.data);
        return response.data;
    } else {
        console.error('Ошибка:', response.error);
        throw new Error(response.error);
    }
}

// ПРОБЛЕМА 5: Функция с проблемами мутации
function updateArray<T>(arr: readonly T[], index: number, newValue: T): T[] {
    if (index >= 0 && index < arr.length) {
        const newArr = [...arr];
        newArr[index] = newValue;
        return newArr;
    }
    return [...arr];
}

// ПРОБЛЕМА 6: Класс с неправильной типизацией событий
type EventCallback = (...args: any[]) => void;
type EventListeners = Record<string, EventCallback[]>;

class EventEmitter {
    private listeners: EventListeners;

    constructor() {
        this.listeners = {};
    }

    on(event: string, callback: EventCallback): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event: string, ...args: any[]): void {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(...args));
        }
    }

    off(event: string, callback: EventCallback): void {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
}

// ПРОБЛЕМА 7: Функция с проблемами асинхронности
async function fetchWithRetry<T>(url: string, maxRetries: number): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    throw lastError;
}

// ПРОБЛЕМА 8: Функция валидации с проблемами типов
interface ValidationRule {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    message?: string;
}

interface ValidationRules {
    [field: string]: ValidationRule;
}

interface FormData {
    [field: string]: string;
}

interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

function validateForm(formData: FormData, rules: ValidationRules): ValidationResult {
    const errors: Record<string, string> = {};

    for (const field in rules) {
        const value = formData[field];
        const rule = rules[field];

        // Add a type guard to ensure rule exists
        if (!rule) continue;

        if (rule.required && (!value || value.trim() === '')) {
            errors[field] = 'Поле обязательно для заполнения';
            continue;
        }

        if (value && rule.minLength !== undefined && value.length < rule.minLength) {
            errors[field] = `Минимальная длина: ${rule.minLength} символов`;
            continue;
        }

        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors[field] = rule.message || 'Неверный формат';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// ПРОБЛЕМА 9: Утилитарная функция с проблемами типов
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = obj[key];
        }
    });
    return result;
}

// ПРОБЛЕМА 10: Функция сравнения с проблемами типов
function isEqual(a: any, b: any): boolean {
    if (a === b) return true;

    if (a == null || b == null) return a === b;

    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        return keysA.every(key => isEqual(a[key], b[key]));
    }

    return a === b;
}

// Примеры использования (должны работать после исправления типизации)
console.log('=== Тестирование processData ===');
console.log(processData([1, 2, 3]));
console.log(processData({ a: 1, b: 2 }));
console.log(processData('hello'));

console.log('\n=== Тестирование getValue ===');
const testObj = { user: { profile: { name: 'Анна' } } };
console.log(getValue(testObj, 'user.profile.name'));
console.log(getValue(testObj, 'user.nonexistent'));

console.log('\n=== Тестирование EventEmitter ===');
const emitter = new EventEmitter();
emitter.on('test', (message) => console.log('Получено:', message));
emitter.emit('test', 'Привет!');

console.log('\n=== Тестирование pick ===');
const user = { name: 'Анна', age: 25, email: 'anna@example.com', password: 'secret' };
const publicData = pick(user, ['name', 'age', 'email']);
console.log('Публичные данные:', publicData);