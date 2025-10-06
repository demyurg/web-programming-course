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

// ПРОБЛЕМА 1: processData
function processData(data: unknown): string[] {
    if (Array.isArray(data)) {
        return data.map(item => String(item));
    }

    if (typeof data === 'object' && data !== null) {
        return Object.entries(data).map(([key, value]) => `${key}: ${value}`);
    }

    return [String(data)];
}

// ПРОБЛЕМА 2: getValue
function getValue<T, K extends string>(obj: T, path: K): unknown {
    const keys = path.split('.') as (keyof any)[];
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

// ПРОБЛЕМА 3: formatUser
interface User {
    firstName: string;
    lastName: string;
    email: string;
    age?: number | null;
    avatar?: string | null;
}

function formatUser(user: User) {
    return {
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email.toLowerCase(),
        age: user.age ?? 'Не указан',
        avatar: user.avatar ?? '/default-avatar.png',
    };
}

// ПРОБЛЕМА 4: handleResponse
interface SuccessResponse<T> {
    success: true;
    data: T;
}

interface ErrorResponse {
    success: false;
    error: string;
}

type Response<T> = SuccessResponse<T> | ErrorResponse;

function isSuccessResponse<T>(response: Response<T>): response is SuccessResponse<T> {
    return response.success === true;
}

function handleResponse<T>(response: Response<T>): T {
    if (isSuccessResponse(response)) {
        console.log('Данные:', response.data);
        return response.data;
    } else {
        console.error('Ошибка:', response.error);
        throw new Error(response.error);
    }
}

// ПРОБЛЕМА 5: updateArray
function updateArray<T>(arr: readonly T[], index: number, newValue: T): T[] {
    if (index < 0 || index >= arr.length) return [...arr];
    const newArr = [...arr];
    newArr[index] = newValue;
    return newArr;
}

// ПРОБЛЕМА 6: EventEmitter
type Listener<T extends any[] = any[]> = (...args: T) => void;

class EventEmitter<Events extends Record<string, any[]>> {
    private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

    on<K extends keyof Events>(event: K, callback: Listener<Events[K]>): void {
        this.listeners[event] ??= [];
        this.listeners[event]!.push(callback);
    }

    emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
        this.listeners[event]?.forEach(callback => callback(...args));
    }

    off<K extends keyof Events>(event: K, callback: Listener<Events[K]>): void {
        this.listeners[event] = this.listeners[event]?.filter(cb => cb !== callback);
    }
}

// ПРОБЛЕМА 7: fetchWithRetry
async function fetchWithRetry<T>(url: string, maxRetries = 3, delayMs = 1000): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json() as T;
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
            }
        }
    }

    throw lastError;
}

// ПРОБЛЕМА 8: validateForm
interface ValidationRule {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    message?: string;
}

type FormData = Record<string, string | undefined>;

function validateForm(formData: FormData, rules: Record<string, ValidationRule>) {
    const errors: Record<string, string> = {};

for (const field in rules) {
    const rule = rules[field];
    if (!rule) continue;

    const value = formData[field]?.trim();

    if (rule.required && !value) {
        errors[field] = 'Поле обязательно для заполнения';
        continue;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = `Минимальная длина: ${rule.minLength} символов`;
        continue;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message ?? 'Неверный формат';
    }
}

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

// ПРОБЛЕМА 9: pick
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

// ПРОБЛЕМА 10: isEqual
function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object' && typeof b === 'object') {
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            return a.every((val, idx) => isEqual(val, b[idx]));
        } else if (!Array.isArray(a) && !Array.isArray(b)) {
            const keysA = Object.keys(a as object);
            const keysB = Object.keys(b as object);
            if (keysA.length !== keysB.length) return false;
            return keysA.every(key => isEqual((a as any)[key], (b as any)[key]));
        }
        return false;
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
const emitter = new EventEmitter();
emitter.on('test', (message) => console.log('Получено:', message));
emitter.emit('test', 'Привет!');

console.log('\n=== Тестирование pick ===');
const user = { name: 'Анна', age: 25, email: 'anna@example.com', password: 'secret' };
const publicData = pick(user, ['name', 'age', 'email']);
console.log('Публичные данные:', publicData);