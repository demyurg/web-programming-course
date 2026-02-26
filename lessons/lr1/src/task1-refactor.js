/*
 * ЗАДАЧА 1: Рефакторинг JavaScript кода в TypeScript
 *
 * Инструкции:
 * 1. Переименуйте этот файл в .ts
 * 2. Добавьте типизацию ко всем функциям и переменным
 * 3. Исправьте все ошибки типизации
 * 4. Убедитесь что код компилируется без ошибок
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
function calculate(operation, a, b) {
    switch (operation) {
        case 'add':
            return a + b;
        case 'subtract':
            return a - b;
        case 'multiply':
            return a * b;
        case 'divide':
            if (b === 0) {
                return null;
            }
            return a / b;
        default:
            return undefined;
    }
}
// Функция для работы с пользователем
function createUser(name, age, email, isAdmin) {
    if (isAdmin === void 0) { isAdmin = false; }
    return {
        name: name,
        age: age,
        email: email,
        isAdmin: isAdmin || false,
        createdAt: new Date(),
        getId: function () {
            return Math.random().toString(36).substr(2, 9);
        }
    };
}
// Обработка списка пользователей
function processUsers(users) {
    return users.map(function (user) {
        return __assign(__assign({}, user), { displayName: user.name.toUpperCase(), isAdult: user.age >= 18 });
    });
}
// Функция поиска пользователя
function findUser(users, criteria) {
    if (typeof criteria === 'string') {
        return users.find(function (user) { return user.name === criteria; });
    }
    if (typeof criteria === 'number') {
        return users.find(function (user) { return user.age === criteria; });
    }
    if (typeof criteria === 'object') {
        return users.find(function (user) {
            return Object.keys(criteria).every(function (key) {
                var key1 = key;
                return user[key1] === criteria[key1];
            });
        });
    }
    return null;
}
// Примеры использования (должны работать после типизации)
console.log(calculate('add', 10, 5)); // 15
console.log(calculate('divide', 10, 0)); // null
var user = createUser('Анна', 25, 'anna@example.com');
console.log(user);
var users = [
    createUser('Петр', 30, 'peter@example.com', true),
    createUser('Мария', 16, 'maria@example.com'),
];
var processedUsers = processUsers(users);
console.log(processedUsers);
var foundUser = findUser(users, 'Петр');
console.log(foundUser);
var foundByAge = findUser(users, 30);
console.log(foundByAge);
var foundByObject = findUser(users, { name: "Мария", age: 16 });
console.log(foundByObject);
