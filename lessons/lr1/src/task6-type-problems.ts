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

interface User_6 {
    firstName?: string | null;
    lastName?: string | null;
    email?: string;
    age?: number | null;
    avatar?: string | null;
}

interface FormattedUser {
    fullName: string;
    email: string;
    age: string | number;
    avatar: string;
}

// ПРОБЛЕМА 1: Функция с any типом
function processData<T extends unknown>(data: T): string[] {
    if (Array.isArray(data)) {    
        return data.map(item => String(item));
    }
    
    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).map(key => 
            `${key}: ${(data as Record<string, unknown>)[key]}`
        );
    }
    
    return [String(data)];
}

// ПРОБЛЕМА 2: Функция с неопределенными возвращаемыми типами
function getValue<T>(obj: unknown, path: string): T | undefined {
    if (obj == null || typeof obj !== 'object') {
        return undefined;
    }
    
    const keys = path.split('.');
    let current: unknown = obj;
    
    for (const key of keys) {
        if (current && typeof current === 'object' && key in (current as object)) {
            current = (current as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }
    
    return current as T;
}

// ПРОБЛЕМА 3: Функция с проблемами null/undefined
function formatUser(user:User_6) {
    const firstName = user.firstName ?? '';
    const lastName = user.lastName ?? '';
    return {
        fullName: `${firstName} ${lastName}`.trim() || 'Имя не указано.',
        email: user.email?.toLowerCase()|| 'Не указан.',
         age: user.age != null ? String(user.age) : 'Не указан',
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

type ApiResponse6<T> = SuccessResponse<T> | ErrorResponse;

function handleResponse<T>(response: ApiResponse6<T>): T {
    if (response.success) {
        console.log('Данные:', response.data);
        return response.data;
    } else {
        console.error('Ошибка:', response.error);
        throw new Error(response.error);
    }
}

// ПРОБЛЕМА 5: Функция с проблемами мутации
function updateArray<T>(arr: T[], index: number, newValue: T): T[] {
    return arr.map((item, i) => i === index ? newValue : item);
}

// ПРОБЛЕМА 6: Класс с неправильной типизацией событий
class EventEmitter {
    private listeners: Record<string, ((...args: any[]) => void)[]> = {};
    constructor() {
        this.listeners = {};
    }
    
    on(event:string, callback:(...args: any[]) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    emit(event:string, ...args:string[]) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(...args));
        }
    }
    
    off(event:string, callback:(...args: any[]) => void) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
}

// ПРОБЛЕМА 7: Функция с проблемами асинхронности
async function fetchWithRetry(url: string, maxRetries: number) {
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
    type Rule = {
        required: boolean, 
        minLength: number,
        pattern?: RegExp, 
        message: string};
    type FormD= Record<string, string>;

    // ПРОБЛЕМА 8: Функция валидации с проблемами типов
    function validateForm(formData: FormD, rules: Record<string, Rule>) {
        const errors: Record<string, string> = {};
        
        for (const field in rules) {
            const value = formData[field];
            const rule = rules[field];
            
            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = 'Поле обязательно для заполнения';
                continue;
            }
            
            if (value && rule.minLength && value.length < rule.minLength) {
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
function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]) {
    const result: Pick<T, K> = {} as Pick<T, K>;
    keys.forEach(key => {
        result[key] = obj[key];
    });
    return result;
}

// ПРОБЛЕМА 10: Функция сравнения с проблемами типов
function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    
    if (a == null || b == null) return a === b;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object' && a !== null && b !== null) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        return keysA.every(key => 
            isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
        );
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

export {}