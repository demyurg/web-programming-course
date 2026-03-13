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

//Вспомогательные функции
interface User {
    firstName: string;
    lastName: string;
    email: string;
    age?: number;
    avatar?: string;
}

interface FormattedUser {
    fullName: string;
    email: string;
    age: string | number;
    avatar: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

interface ValidationRule {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    message?: string;
}

interface ValidationRules {
    [field: string]: ValidationRule;
}

interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

type EventCallback = (...args: any[]) => void;

// ПРОБЛЕМА 1: Функция с any типом
function processData(data: unknown): string[] {
    if (Array.isArray(data)) {
        return data.map(item => {
            if (item == null) return 'null';
            return String(item);
        });
    }
    
    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).map(key => {
            const value = (data as Record<string, unknown>)[key];
            return `${key}: ${value}`;
        });
    }
    
    return [String(data)];
}
// ПРОБЛЕМА 2: Функция с неопределенными возвращаемыми типами
function getValue<T = unknown>(obj: unknown, path: string): T | undefined {
    if (typeof obj !== 'object' || obj === null) {
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
function formatUser(user: User): FormattedUser {
    return {
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email.toLowerCase(),
        age: user.age ?? 'Не указан',
        avatar: user.avatar || '/default-avatar.png'
    };
}

// ПРОБЛЕМА 4: Функция с union типами без type guards
function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
    return response.success && response.data !== undefined;
}

function isErrorResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; error: string } {
    return !response.success && response.error !== undefined;
}

function handleResponse<T>(response: ApiResponse<T>): T {
    if (isSuccessResponse(response)) {
        console.log('Данные:', response.data);
        return response.data;
    } else if (isErrorResponse(response)) {
        console.error('Ошибка:', response.error);
        throw new Error(response.error);
    } else {
        throw new Error('Неизвестный формат ответа');
    }
}

// ПРОБЛЕМА 5: Функция с проблемами мутации
function updateArray<T>(arr: readonly T[], index: number, newValue: T): T[] {
    if (index >= 0 && index < arr.length) {
        const newArray = [...arr];
        newArray[index] = newValue;
        return newArray;
    }
    return [...arr];
}
// ПРОБЛЕМА 6: Класс с неправильной типизацией событий
class EventEmitter {
    private listeners: Record<string, EventCallback[]> = {};
    
    on(event: string, callback: EventCallback): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    emit(event: string, ...args: unknown[]): void {
        const eventListeners = this.listeners[event];
        if (eventListeners) {
            eventListeners.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    off(event: string, callback: EventCallback): void {
        const eventListeners = this.listeners[event];
        if (eventListeners) {
            this.listeners[event] = eventListeners.filter(cb => cb !== callback);
        }
    }
    
    removeAllListeners(event?: string): void {
        if (event) {
            delete this.listeners[event];
        } else {
            this.listeners = {};
        }
    }
}

// ПРОБЛЕМА 7: Функция с проблемами асинхронности
async function fetchWithRetry<T>(
    url: string, 
    maxRetries: number = 3, 
    options: RequestInit = {}
): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json() as T;
        } catch (error) {
            lastError = error as Error;
            
            if (attempt < maxRetries - 1) {
                const delay = 1000 * Math.pow(2, attempt); // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay));
                console.warn(`Attempt ${attempt + 1} failed, retrying...`);
            }
        }
    }
    
    throw lastError || new Error('Max retries exceeded');
}
// ПРОБЛЕМА 8: Функция валидации с проблемами типов
function validateForm<T extends Record<string, unknown>>(
    formData: T, 
    rules: ValidationRules
): ValidationResult {
    const errors: Record<string, string> = {};
    
    for (const field in rules) {
        const value = formData[field];
        const rule = rules[field];
        
        // Проверка на обязательное поле
        if (rule.required) {
            if (value === undefined || value === null || value === '') {
                errors[field] = 'Поле обязательно для заполнения';
                continue;
            }
            
            // Для строк проверяем, не состоит ли только из пробелов
            if (typeof value === 'string' && value.trim() === '') {
                errors[field] = 'Поле обязательно для заполнения';
                continue;
            }
        }
        
        // Проверка минимальной длины (только для строк)
        if (value && rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
            errors[field] = `Минимальная длина: ${rule.minLength} символов`;
            continue;
        }
        
        // Проверка по регулярному выражению (только для строк)
        if (value && rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
            errors[field] = rule.message || 'Неверный формат';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// ПРОБЛЕМА 9: Утилитарная функция с проблемами типов
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    
    return result;
}

// ПРОБЛЕМА 10: Функция сравнения с проблемами типов
function isEqual(a: unknown, b: unknown): boolean {
    // Примитивы и строгое равенство
    if (a === b) return true;
    
    // Проверка на null/undefined
    if (a == null || b == null) return a === b;
    
    // Разные типы
    if (typeof a !== typeof b) return false;
    
    // Сравнение дат
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    
    // Сравнение массивов
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        
        return a.every((item, index) => isEqual(item, b[index]));
    }
    
    // Сравнение объектов
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        return keysA.every(key => {
            return key in (b as object) && 
                   isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]);
        });
    }
    
    // Для остальных случаев (функции, символы и т.д.)
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