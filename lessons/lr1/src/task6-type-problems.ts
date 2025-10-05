/*Курочкин ПИЭ-21
 * ЗАДАЧА 6: Решение типовых проблем типизации
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Исправьте все проблемы с типизацией
 * 3. Используйте type guards, utility types и другие продвинутые возможности
 * 4. Добавьте proper обработку ошибок и edge cases
 */

// Проблемные функции, которые нужно исправить
type Primitive = string | number | boolean | symbol | null | undefined;
type PlainObject = Record<string, unknown>;

type Maybe<T> = T | undefined;
type Path = string; // 'a.b.c'

// Api-подобный ответ
type ApiResult<T> = { success: true; data: T } | { success: false; error: string };
// ПРОБЛЕМА 1: Функция с any типом
function processData(data: unknown) {
    if (Array.isArray(data)) {
        return data.map(item => String(item));
    }

    if (isPlainObject(data)) {
        return Object.keys(data).map(key => `${key}: ${String((data as PlainObject)[key])}`);
    }

    // На всякий случай — null/undefined обрабатываем
    if (data === null || data === undefined) return ['null'];
    return [String(data)];
}
function isPlainObject(v: unknown): v is PlainObject {
    return typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date);
}
// ПРОБЛЕМА 2: Функция с неопределенными возвращаемыми типами
function getValue<T = unknown>(obj: unknown, path: Path) {
    if (!isPlainObject(obj)) return undefined;

    const keys = path.split('.').filter(k => k.length > 0);
    let current: any = obj;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }

    return current as Maybe<T>;
}


// ПРОБЛЕМА 3: Функция с проблемами null/undefined
interface RawUser {
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

function formatUser(user: RawUser | null | undefined) {
    const first = (user?.firstName ?? '').trim();
    const last = (user?.lastName ?? '').trim();
    const fullName = [first, last].filter(Boolean).join(' ') || 'Не указано';

    const email = (user?.email ?? '').toString().trim().toLowerCase() || 'no-reply@example.com';

    const age = user?.age ?? 'Не указан';

    const avatar = user?.avatar && String(user.avatar).trim() ? String(user.avatar) : '/default-avatar.png';

    return {
        fullName,
        email,
        age,
        avatar
    };
}
type SuccessResponse<T> = { success: true; data: T };
type ErrorResponse = { success: false; error: string };
type ResponseUnion<T> = SuccessResponse<T> | ErrorResponse;

function isSuccess<T>(r: ResponseUnion<T>): r is SuccessResponse<T> {
    return r.success === true;
}

// ПРОБЛЕМА 4: Функция с union типами без type guards
function handleResponse<T>(response: ResponseUnion<T>){
    if (isSuccess(response)) {
        // можешь добавить дополнительную валидацию данных здесь
        return response.data;
    } else {
        // логируем и выбрасываем
        console.error('Ошибка:', response.error);
        throw new Error(response.error);
    }
}


// ПРОБЛЕМА 5: Функция с проблемами мутации
function updateArray<T>(arr: readonly T[], index: number, newValue: T) {
    if (index < 0 || index >= arr.length) return [...arr];
    return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}

// ПРОБЛЕМА 6: Класс с неправильной типизацией событий
type EventMap = Record<string, (...args: any[]) => void>;

class EventEmitter<E extends EventMap = Record<string, (...args: any[]) => void>> {
    private listeners: { [K in keyof E]?: E[K][] } = {};

    constructor() {
        this.listeners = {};
    }
    
     on<K extends keyof E>(event: K, callback: E[K]){
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    emit<K extends keyof E>(event: K, ...args: Parameters<E[K]>) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(...args));
        }
    }
    
    off<K extends keyof E>(event: K, callback?: E[K]) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
}

// ПРОБЛЕМА 7: Функция с проблемами асинхронности


async function fetchWithRetry<T>(url: string, maxRetries: number = 3) {
    
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        } catch (error) {
            lastError = error;
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

interface FormData {
    [key: string]: string | undefined;
}

function validateForm(formData: FormData, rules: Record<string, ValidationRule>) {
    const errors: Record<string, string> = {};
    
    for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field];
        
        if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
            errors[field] = rule.message || 'Поле обязательно для заполнения';
            continue;
        }
        
        if (value && typeof value === 'string' && rule.minLength && value.length < rule.minLength) {
            errors[field] = rule.message || `Минимальная длина: ${rule.minLength} символов`;
            continue;
        }
        
        if (value && typeof value === 'string' && rule.pattern && !rule.pattern.test(value)) {
            errors[field] = rule.message || 'Неверный формат';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// ПРОБЛЕМА 9: Утилитарная функция с проблемами типов
function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]) {
    const result: Pick<T, K> = {} as Pick<T, K>;
    keys.forEach(key => {
        result[key] = obj[key];
    });
    return result;
}
// ПРОБЛЕМА 10: Функция сравнения с проблемами типов
function isEqual<T>(a: T, b: T) {
    if (a === b) return true;
    
    if (a == null || b == null) return a === b;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        return keysA.every(key => isEqual(a[key], b[key]));
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