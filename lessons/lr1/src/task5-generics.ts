/*
 * ЗАДАЧА 5: Практика с Generics
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Добавьте generic типы ко всем функциям где это необходимо
 * 3. Создайте типизированные интерфейсы и классы
 * 4. Используйте ограничения generics (constraints)
 */

// Универсальные utility функции и классы

// TODO: Типизировать с использованием generics

interface ApiResponse<T> {
    data?: Date;
    success: boolean
    message?: string
    error: T
}

// Утилита для кеширования
class Cache {
    constructor() {
        this.cache = new Map();
    }
    
    set(key: string, value: object) {
        this.cache.set(key, value);
    }
    
    get(key: string) {
        return this.cache.get(key);
    }
    
    has(key: string) {
        return this.cache.has(key);
    }
    
    clear() {
        this.cache.clear();
    }
    
    delete(key: string) {
        return this.cache.delete(key);
    }
    
    getSize() {
        return this.cache.size;
    }
}

// Универсальная функция фильтрации
function filterArray<T>(array: Array<number>, predicate: (value: T, index?: number, array?: T[]) => boolean ) {
    return array.filter(predicate);
}

// Универсальная функция маппинга
function mapArray(array: Array<number>, mapper) {
    return array.map(mapper);
}

// Функция для получения первого элемента
function getFirst(array: Array<number>) {
    return array.length > 0 ? array[0] : undefined;
}

// Функция для получения последнего элемента
function getLast(array: Array<number>) {
    return array.length > 0 ? array[array.length - 1] : undefined;
}

// Функция группировки по ключу
function groupBy(array: Array<number>, keyGetter: Array<number>) {
    const groups = {};
    
    array.forEach(item => {
        const key = keyGetter(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
    });
    
    return groups;
}

// Функция для создания уникального массива
function unique(array: Array<number>, keyGetter: boolean) {
    if (!keyGetter) {
        return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
        const key = keyGetter(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

// Функция сортировки с кастомным компаратором
function sortBy(array: Array<number>, compareFn) {
    return [...array].sort(compareFn);
}

// Класс для работы с коллекцией
class Collection {
    constructor(items) {
        this.items = items || [];
    }
    
    add(item) {
        this.items.push(item);
        return this;
    }
    
    remove(predicate) {
        this.items = this.items.filter(item => !predicate(item));
        return this;
    }
    
    find(predicate) {
        return this.items.find(predicate);
    }
    
    filter(predicate) {
        return new Collection(this.items.filter(predicate));
    }
    
    map(mapper) {
        return new Collection(this.items.map(mapper));
    }
    
    reduce(reducer, initialValue) {
        return this.items.reduce(reducer, initialValue);
    }
    
    toArray() {
        return [...this.items];
    }
    
    get length() {
        return this.items.length;
    }
}

// Класс Repository для работы с данными
class Repository {
    constructor() {
        this.items = [];
        this.nextId = 1;
    }
    
    create(data: Date) {
        const item = {
            id: this.nextId++,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.items.push(item);
        return item;
    }
    
    findById(id: number) {
        return this.items.find(item => item.id === id);
    }
    
    findAll() {
        return [...this.items];
    }
    
    update(id: number, updates) {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) return null;
        
        this.items[index] = {
            ...this.items[index],
            ...updates,
            updatedAt: new Date()
        };
        
        return this.items[index];
    }
    
    delete(id: number) {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) return false;
        
        this.items.splice(index, 1);
        return true;
    }
    
    count() {
        return this.items.length;
    }
}

// Функция для объединения объектов
function merge(target, ...sources) {
    return Object.assign({}, target, ...sources);
}

// Функция для deep clone
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    const cloned = {};
    Object.keys(obj).forEach(key => {
        cloned[key] = deepClone(obj[key]);
    });
    
    return cloned;
}

// Примеры использования
console.log('=== Тестирование Cache ===');
const cache = new Cache();
cache.set('user:1', { name: 'Анна', age: 25 });
console.log('Получили из кеша:', cache.get('user:1'));

console.log('\n=== Тестирование фильтрации и маппинга ===');
const numbers = [1, 2, 3, 4, 5];
const evenNumbers = filterArray(numbers, n => n % 2 === 0);
const doubled = mapArray(numbers, n => n * 2);
console.log('Четные числа:', evenNumbers);
console.log('Удвоенные:', doubled);

console.log('\n=== Тестирование Collection ===');
const users = new Collection([
    { name: 'Анна', age: 25 },
    { name: 'Петр', age: 30 },
    { name: 'Мария', age: 22 }
]);

const adults = users.filter(user => user.age >= 25);
const names = users.map(user => user.name);
console.log('Взрослые:', adults.toArray());
console.log('Имена:', names.toArray());

console.log('\n=== Тестирование Repository ===');
const userRepo = new Repository();
const newUser = userRepo.create({ name: 'Анна', email: 'anna@example.com' });
console.log('Создан пользователь:', newUser);
console.log('Всего пользователей:', userRepo.count());