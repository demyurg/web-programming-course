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
type Processable = unknown;

function processData(data: Processable): string[] {
    if (Array.isArray(data)) {
        return data.map(item => String(item));
    }
    
    if (typeof data === 'object' && data !== null) {
        return Object.entries(data as Record<string, unknown>).map(([key, value]) => `${key}: ${String(value)}`);
    }
    
    return [String(data)];
}

// ПРОБЛЕМА 2: Функция с неопределенными возвращаемыми типами
function getValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;
    
    for (const key of keys) {
        if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
            current = (current as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }
    
    return current;
}

// ПРОБЛЕМА 3: Функция с проблемами null/undefined
interface User {
    firstName?: string;
    lastName?: string;
    email?: string;
    age?: number;
    avatar?: string;
}

interface FormattedUser {
    fullName: string;
    email: string;
    age: string;
    avatar: string;
}

function formatUser(user: User): FormattedUser {
    const firstName = user.firstName ?? '';
    const lastName = user.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Неизвестный пользователь';
    
    const email = (user.email ?? '').toLowerCase();
    
    const age = user.age !== undefined ? user.age.toString() : 'Не указан';
    
    const avatar = user.avatar ?? '/default-avatar.png';
    
    return {
        fullName,
        email,
        age,
        avatar
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

function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
    return response.success === true;
}

function handleResponse<T>(response: ApiResponse<T>): T {
    if (isSuccessResponse(response)) {
        console.log('Данные:', response.data);
        return response.data;
    } else {
        console.error('Ошибка:', response.error);
        throw new Error(response.error);
    }
}

// ПРОБЛЕМА 5: Функция с проблемами мутации
function updateArray<T>(arr: readonly T[], index: number, newValue: T): T[] {
    if (index < 0 || index >= arr.length) {
        return [...arr];
    }
    
    return [
        ...arr.slice(0, index),
        newValue,
        ...arr.slice(index + 1)
    ];
}

// ПРОБЛЕМА 6: Класс с неправильной типизацией событий
interface EventMap {
    [event: string]: (...args: any[]) => void;
}

class EventEmitter<T extends EventMap = Record<string, (...args: any[]) => void>> {
    private listeners: { [K in keyof T]?: T[K][] } = {};
    
    on<K extends keyof T>(event: K, callback: T[K]): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(callback);
    }
    
    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
        if (this.listeners[event]) {
            this.listeners[event]!.forEach(callback => callback(...args));
        }
    }
    
    off<K extends keyof T>(event: K, callback: T[K]): void {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event]!.filter(cb => cb !== callback);
        }
    }
}

// ПРОБЛЕМА 7: Функция с проблемами асинхронности
async function fetchWithRetry<T>(url: string, maxRetries: number = 3): Promise<T> {
    let lastError: Error | undefined;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data as T;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    
    throw lastError ?? new Error('Неизвестная ошибка после всех попыток');
}

// ПРОБЛЕМА 8: Функция валидации с проблемами типов
type FormData = Record<string, string | undefined>;

interface Rule {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    message?: string;
}

type Rules = Record<string, Rule>;

interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

function validateForm(formData: FormData, rules: Rules): ValidationResult {
    const errors: Record<string, string> = {};
    
    for (const field in rules) {
        const value = formData[field];
        const rule = rules[field];
        
        if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
            errors[field] = 'Поле обязательно для заполнения';
            continue;
        }
        
        if (value && typeof value === 'string') {
            if (rule.minLength && value.length < rule.minLength) {
                errors[field] = `Минимальная длина: ${rule.minLength} символов`;
                continue;
            }
            
            if (rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || 'Неверный формат';
            }
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// ПРОБЛЕМА 9: Утилитарная функция с проблемами типов
function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result: Partial<Pick<T, K>> = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result as Pick<T, K>;
}

// ПРОБЛЕМА 10: Функция сравнения с проблемами типов
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function isEqual(a: JsonValue, b: JsonValue): boolean {
    if (a === b) return true;
    
    if (a == null || b == null) return a === b;
    
    if (typeof a !== typeof b) return false;
    
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((item, index) => isEqual(item, b[index]));
    }
    
    if (typeof a === 'object') {
        const keysA = Object.keys(a as object);
        const keysB = Object.keys(b as object);
        
        if (keysA.length !== keysB.length) return false;
        
        return keysA.every(key => isEqual((a as any)[key], (b as any)[key]));
    }
    
    return false;
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
interface TestEvents {
    test: (message: string) => void;
}
const emitter = new EventEmitter<TestEvents>();
emitter.on('test', (message) => console.log('Получено:', message));
emitter.emit('test', 'Привет!');

console.log('\n=== Тестирование pick ===');
const user = { name: 'Анна', age: 25, email: 'anna@example.com', password: 'secret' };
const publicData = pick(user, ['name', 'age', 'email']);
console.log('Публичные данные:', publicData);