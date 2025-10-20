// Тип операции калькулятора
type OperationType = 'add' | 'subtract' | 'multiply' | 'divide';

// Интерфейс для описания структуры пользователя
interface User {
    name: string;
    age: number;
    email: string;
    isAdmin?: boolean;
    createdAt: Date;
    getId(): string;
}

// Калькулятор с добавлением типов
function calculate(operation: OperationType, a: number, b: number): number | null | undefined {
    switch (operation) {
        case 'add': return a + b;
        case 'subtract': return a - b;
        case 'multiply': return a * b;
        case 'divide':
            if (b === 0) return null;
            return a / b;
        default: return undefined;
    }
}

// Функция для создания пользователя с точной типизацией
function createUser(name: string, age: number, email: string, isAdmin?: boolean): User {
    return {
        name,
        age,
        email,
        isAdmin: isAdmin ?? false,
        createdAt: new Date(),
        getId: function() {
            return Math.random().toString(36).slice(2, 9);
        },
    };
}

// Обработка списка пользователей с правильным описанием типов
function processUsers(users: User[]): User[] {
    return users.map((user) => ({
        ...user,
        displayName: user.name.toUpperCase(),
        isAdult: user.age >= 18,
    }));
}

// Функция поиска пользователя с улучшенной типизацией критериев
function findUser(users: User[], criteria: string | number | Partial<User>): User | null {
    if (typeof criteria === 'string') {
        return users.find((user) => user.name === criteria) || null;
    }
    if (typeof criteria === 'number') {
        return users.find((user) => user.age === criteria) || null;
    }
    if (typeof criteria === 'object') {
        const keys = Object.keys(criteria) as Array<keyof User>;
        return users.find((user) =>
            keys.every((key) => user[key] === criteria[key])
        ) || null;
    }
    return null;
}

// Примеры использования после типизации
console.log(calculate('add', 10, 5));     // Результат: 15
console.log(calculate('divide', 10, 0));  // Результат: null

const user = createUser('Анна', 25, 'anna@example.com');
console.log(user);

const users = [
    createUser('Петр', 30, 'peter@example.com', true),
    createUser('Мария', 16, 'maria@example.com'),
];

const processedUsers = processUsers(users);
console.log(processedUsers);

const foundUser = findUser(users, 'Петр');
console.log(foundUser);

const foundByAge = findUser(users, 30);
console.log(foundByAge);

const foundByObject = findUser(users, { name: 'Мария', age: 16 });
console.log(foundByObject);