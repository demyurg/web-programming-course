type Operation = "add" | "subtract" | "multiply" | "divide";

function calculate(operation: Operation, a: number, b: number): number | null {
  switch (operation) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      if (b === 0) {
        return null;
      }
      return a / b;
  }
}

interface User {
  name: string;
  age: number;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  getId: () => string;
  displayName?: string;
  isAdult?: boolean;
}

function createUser(
  name: string,
  age: number,
  email: string,
  isAdmin?: boolean
): User {
  return {
    name,
    age,
    email,
    isAdmin: isAdmin ?? false,
    createdAt: new Date(),
    getId: function (this: User) {
      return Math.random().toString(36).substr(2, 9);
    },
  };
}

interface ProcessedUser extends User {
  displayName: string;
  isAdult: boolean;
}

function processUsers(users: User[]): ProcessedUser[] {
  return users.map((user) => ({
    ...user,
    displayName: user.name.toUpperCase(),
    isAdult: user.age >= 18,
  }));
}

type SearchCriteria =
  | string
  | number
  | Partial<Pick<User, "name" | "age" | "email" | "isAdmin">>;

function findUser(users: User[], criteria: SearchCriteria): User | undefined {
  if (typeof criteria === "string") {
    return users.find((user) => user.name === criteria);
  }

  if (typeof criteria === "number") {
    return users.find((user) => user.age === criteria);
  }

  if (typeof criteria === "object" && criteria !== null) {
    return users.find((user) => {
      const criteriaKeys = Object.keys(criteria) as (keyof typeof criteria)[];
      return criteriaKeys.every((key) => {
        return user[key as keyof User] === (criteria as any)[key];
      });
    });
  }

  return undefined;
}

// Примеры использования

console.log(calculate("add", 10, 5));
console.log(calculate("divide", 10, 0));

const user = createUser("Анна", 25, "anna@example.com");
console.log(user);

const users: User[] = [
  createUser("Петр", 30, "peter@example.com", true),
  createUser("Мария", 16, "maria@example.com"),
];

const processedUsers = processUsers(users);
console.log(processedUsers);

const foundUser = findUser(users, "Петр");
console.log(foundUser);

const foundByAge = findUser(users, 30);
console.log(foundByAge);

const foundByObject = findUser(users, { name: "Мария", age: 16 });
console.log(foundByObject);

const foundByEmail = findUser(users, { email: "peter@example.com" });
console.log(foundByEmail);
