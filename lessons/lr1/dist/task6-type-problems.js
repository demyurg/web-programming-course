"use strict";
/*
 * ЗАДАЧА 6: Решение типовых проблем типизации
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Исправьте все проблемы с типизацией
 * 3. Используйте type guards, utility types и другие продвинутые возможности
 * 4. Добавьте proper обработку ошибок и edge cases
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Проблемные функции, которые нужно исправить
function processData(data) {
    if (Array.isArray(data)) {
        return data.map(item => String(item));
    }
    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).map(key => `${key}: ${String(data[key])}`);
    }
    return [String(data)];
}
function getValue(obj, path) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (typeof current === 'object' && current !== null && key in current) {
            current = current[key];
        }
        else {
            return undefined;
        }
    }
    return current;
}
function formatUser(user) {
    if (!user) {
        return {
            fullName: 'Гость',
            email: 'Не указан',
            age: 'Не указан',
            avatar: '/default-avatar.png',
        };
    }
    const firstName = user.firstName ?? '';
    const lastName = user.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    return {
        fullName: fullName || 'Безымянный',
        email: user.email?.toLowerCase() ?? 'Не указан',
        age: user.age != null ? String(user.age) : 'Не указан',
        avatar: user.avatar || '/default-avatar.png',
    };
}
function handleResponse(response) {
    if (response.success) {
        console.log('Данные:', response.data);
        return response.data;
    }
    else {
        console.error('Ошибка:', response.error);
        throw new Error(response.error);
    }
}
function updateArray(arr, index, newValue) {
    if (index < 0 || index >= arr.length) {
        return [...arr];
    }
    return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}
class EventEmitter {
    listeners = {};
    constructor() {
        this.listeners = {};
    }
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(...args));
        }
    }
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
}
async function fetchWithRetry(url, maxRetries) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return (await response.json());
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    throw (lastError ??
        new Error('Не удалось выполнить запрос после нескольких попыток.'));
}
function validateForm(formData, rules) {
    const errors = {};
    for (const field in rules) {
        const key = field;
        const value = formData[key];
        const rule = rules[key];
        if (!rule)
            continue;
        if (rule.required && (!value || value.trim() === '')) {
            errors[key] = 'Поле обязательно для заполнения';
            continue;
        }
        if (value && rule.minLength && value.length < rule.minLength) {
            errors[key] = `Минимальная длина: ${rule.minLength} символов`;
            continue;
        }
        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors[key] = rule.message || 'Неверный формат';
        }
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}
function pick(obj, keys) {
    const result = {};
    keys.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = obj[key];
        }
    });
    return result;
}
function isEqual(a, b) {
    if (Object.is(a, b))
        return true;
    if (a === null ||
        typeof a !== 'object' ||
        b === null ||
        typeof b !== 'object') {
        return false;
    }
    const objA = a;
    const objB = b;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length)
        return false;
    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(objB, key) ||
            !isEqual(objA[key], objB[key])) {
            return false;
        }
    }
    return true;
}
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
emitter.on('test', message => console.log('Получено:', message));
emitter.emit('test', 'Привет!');
console.log('\n=== Тестирование pick ===');
const user = {
    name: 'Анна',
    age: 25,
    email: 'anna@example.com',
    password: 'secret',
};
const publicData = pick(user, ['name', 'age', 'email']);
console.log('Публичные данные:', publicData);
//# sourceMappingURL=task6-type-problems.js.map