/*
 * ЗАДАЧА 1: Рефакторинг JavaScript кода в TypeScript
 * 
 * Инструкции:
 * 1. Переименуйте этот файл в .ts
 * 2. Добавьте типизацию ко всем функциям и переменным
 * 3. Исправьте все ошибки типизации
 * 4. Убедитесь что код компилируется без ошибок
 */

// Калькулятор с проблемами типизации (1 задание)
type Operation = 'add' | 'subtract' | 'multiply' | 'divide'
function calculate(operation: Operation, a: number, b: number): number | null | undefined {

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



//Работа с пользователем (2 задание)
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
            return Math.random().toString(36).substr(2, 9);
        }
    };
}

// Обработка списка пользователей (3 задание)
function processUsers(users: User[]) {
    return users.map(user => {
        return {
            ...user,
            displayName: user.name.toUpperCase(),
            isAdult: user.age >= 18
        };
    });
}

// Функция поиска пользователя
function findUser(users: User[], criteria: string | number| Partial<User>) {
    if (typeof criteria === 'string') {
        return users.find(user => user.name === criteria);
    }
    if (typeof criteria === 'number') {
        return users.find(user => user.age === criteria);
    }
    if (typeof criteria === 'object') {
        return users.find(user => {
            return (Object.keys(criteria) as Array<keyof User>).every(key => user[key] === criteria[key]);
        });
    }
    return null;
}

// Примеры использования (должны работать после типизации)
console.log(calculate('add', 10, 5)); // 15
console.log(calculate('divide', 10, 0)); // null

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

export{}