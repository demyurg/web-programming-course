/*
 * ЗАДАЧА 1: Рефакторинг JavaScript кода в TypeScript
 * Я сама добавила типы и исправила ошибки
 */

// Калькулятор с типами
// operation - операция (сложение, вычитание и т.д.)
// a, b - числа
function calculate(operation: string, a: number, b: number): number | null | undefined {
    switch (operation) {
        case 'add':
            return a + b;
        case 'subtract':
            return a - b;
        case 'multiply':
            return a * b;
        case 'divide':
            if (b === 0) {
                return null; // деление на 0 не делаем
            }
            return a / b;
        default:
            return undefined; // если операции нет, возвращаем undefined
    }
}

// Функция для создания пользователя с типами
interface User {
    name: string;
    age: number;
    email: string;
    isAdmin: boolean;
    createdAt: Date;
    getId: () => string;
}

function createUser(name: string, age: number, email: string, isAdmin: boolean = false): User {
    return {
        name,
        age,
        email,
        isAdmin,
        createdAt: new Date(),
        getId: function() {
            return Math.random().toString(36).substr(2, 9); // просто случайный id
        }
    };
}

// Функция обработки массива пользователей
interface ProcessedUser extends User {
    displayName: string;
    isAdult: boolean;
}

function processUsers(users: User[]): ProcessedUser[] {
    return users.map(user => {
        return {
            ...user,
            displayName: user.name.toUpperCase(), // имя большими буквами
            isAdult: user.age >= 18
        };
    });
}

// Функция поиска пользователя
// criteria может быть string, number или объект
function findUser(users: User[], criteria: string | number | Partial<User>): User | undefined | null {
    if (typeof criteria === 'string') {
        return users.find((user: User) => user.name === criteria);
    }
    if (typeof criteria === 'number') {
        return users.find((user: User) => user.age === criteria);
    }
    if (typeof criteria === 'object') {
        return users.find((user: User) => {
            return Object.keys(criteria).every(key => {
                return (user as any)[key] === (criteria as any)[key];
            });
        });
    }
    return null;
}

// Примеры использования
console.log(calculate('add', 10, 5)); // 15
console.log(calculate('divide', 10, 0)); // null

const user = createUser('Анна', 25, 'anna@example.com', false); // теперь isAdmin по умолчанию false
console.log(user);

const users = [
    createUser('Петр', 30, 'peter@example.com', true),
    createUser('Мария', 16, 'maria@example.com', false),
];

const processedUsers = processUsers(users);
console.log(processedUsers);

const foundUser = findUser(users, 'Петр');
console.log(foundUser);

const foundByAge = findUser(users, 16);
console.log(foundByAge);

const foundByObject = findUser(users, { name: 'Мария', age: 16 });
console.log(foundByObject);
