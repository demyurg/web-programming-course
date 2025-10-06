/*
 * ЗАДАЧА 5: Практика с Generics
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Добавьте generic типы ко всем функциям где это необходимо
 * 3. Создайте типизированные интерфейсы и классы
 * 4. Используйте ограничения generics (constraints)
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// Универсальные utility функции и классы
// TODO: Типизировать с использованием generics
// Утилита для кеширования
var Cache = /** @class */ (function () {
    function Cache() {
        this.cache = new Map();
    }
    Cache.prototype.set = function (key, value) {
        this.cache.set(key, value);
    };
    Cache.prototype.get = function (key) {
        return this.cache.get(key);
    };
    Cache.prototype.has = function (key) {
        return this.cache.has(key);
    };
    Cache.prototype.clear = function () {
        this.cache.clear();
    };
    Cache.prototype.delete = function (key) {
        return this.cache.delete(key);
    };
    Cache.prototype.getSize = function () {
        return this.cache.size;
    };
    return Cache;
}());
// Универсальная функция фильтрации
function filterArray(array, predicate) {
    return array.filter(predicate);
}
// Универсальная функция маппинга
function mapArray(array, mapper) {
    return array.map(mapper);
}
// Функция для получения первого элемента
function getFirst(array) {
    return array.length > 0 ? array[0] : undefined;
}
// Функция для получения последнего элемента
function getLast(array) {
    return array.length > 0 ? array[array.length - 1] : undefined;
}
// Функция группировки по ключу
function groupBy(array, keyGetter) {
    var groups = {};
    array.forEach(function (item) {
        var key = keyGetter(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
    });
    return groups;
}
// Функция для создания уникального массива
function unique(array, keyGetter) {
    if (!keyGetter) {
        return __spreadArray([], new Set(array), true);
    }
    var seen = new Set();
    return array.filter(function (item) {
        var key = keyGetter(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
// Функция сортировки с кастомным компаратором
function sortBy(array, compareFn) {
    return __spreadArray([], array, true).sort(compareFn);
}
// Класс для работы с коллекцией
var Collection = /** @class */ (function () {
    function Collection(items) {
        this.items = items || [];
    }
    Collection.prototype.add = function (item) {
        this.items.push(item);
        return this;
    };
    Collection.prototype.remove = function (predicate) {
        this.items = this.items.filter(function (item) { return !predicate(item); });
        return this;
    };
    Collection.prototype.find = function (predicate) {
        return this.items.find(predicate);
    };
    Collection.prototype.filter = function (predicate) {
        return new Collection(this.items.filter(predicate));
    };
    Collection.prototype.map = function (mapper) {
        return new Collection(this.items.map(mapper));
    };
    Collection.prototype.reduce = function (reducer, initialValue) {
        return this.items.reduce(reducer, initialValue);
    };
    Collection.prototype.toArray = function () {
        return __spreadArray([], this.items, true);
    };
    Object.defineProperty(Collection.prototype, "length", {
        get: function () {
            return this.items.length;
        },
        enumerable: false,
        configurable: true
    });
    return Collection;
}());
// Класс Repository для работы с данными
var Repository = /** @class */ (function () {
    function Repository() {
        this.items = [];
        this.nextId = 1;
    }
    Repository.prototype.create = function (data) {
        var item = __assign(__assign({ id: this.nextId++ }, data), { createdAt: new Date(), updatedAt: new Date() });
        this.items.push(item);
        return item;
    };
    Repository.prototype.findById = function (id) {
        return this.items.find(function (item) { return item.id === id; });
    };
    Repository.prototype.findAll = function () {
        return __spreadArray([], this.items, true);
    };
    Repository.prototype.update = function (id, updates) {
        var index = this.items.findIndex(function (item) { return item.id === id; });
        if (index === -1)
            return null;
        this.items[index] = __assign(__assign(__assign({}, this.items[index]), updates), { updatedAt: new Date() });
        return this.items[index];
    };
    Repository.prototype.delete = function (id) {
        var index = this.items.findIndex(function (item) { return item.id === id; });
        if (index === -1)
            return false;
        this.items.splice(index, 1);
        return true;
    };
    Repository.prototype.count = function () {
        return this.items.length;
    };
    return Repository;
}());
// Функция для объединения объектов
function merge(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    return Object.assign.apply(Object, __spreadArray([{}, target], sources, false));
}
// Функция для deep clone
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (Array.isArray(obj)) {
        return obj.map(function (item) { return deepClone(item); });
    }
    var cloned = {};
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}
// Примеры использования
console.log('=== Тестирование Cache ===');
var cache = new Cache();
cache.set('user:1', { name: 'Анна', age: 25 });
console.log('Получили из кеша:', cache.get('user:1'));
console.log('\n=== Тестирование фильтрации и маппинга ===');
var numbers = [1, 2, 3, 4, 5];
var evenNumbers = filterArray(numbers, function (n) { return n % 2 === 0; });
var doubled = mapArray(numbers, function (n) { return n * 2; });
console.log('Четные числа:', evenNumbers);
console.log('Удвоенные:', doubled);
console.log('\n=== Тестирование Collection ===');
var users = new Collection([
    { name: 'Анна', age: 25 },
    { name: 'Петр', age: 30 },
    { name: 'Мария', age: 22 },
]);
var adults = users.filter(function (user) { return user.age >= 25; });
var names = users.map(function (user) { return user.name; });
console.log('Взрослые:', adults.toArray());
console.log('Имена:', names.toArray());
console.log('\n=== Тестирование Repository ===');
var userRepo = new Repository();
var newUser = userRepo.create({ name: 'Анна', email: 'anna@example.com' });
console.log('Создан пользователь:', newUser);
console.log('Всего пользователей:', userRepo.count());
