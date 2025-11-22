class Cache<K = string, V = any> {
  private cache = new Map<K, V>();

  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  getSize(): number {
    return this.cache.size;
  }
}

function filterArray<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  return array.filter(predicate);
}

function mapArray<T, U>(
  array: T[],
  mapper: (item: T, index: number) => U
): U[] {
  return array.map(mapper);
}

function getFirst<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

function getLast<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[array.length - 1] : undefined;
}

function groupBy<T, K extends keyof any>(
  array: T[],
  keyGetter: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;

  array.forEach((item) => {
    const key = keyGetter(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });

  return groups;
}

function unique<T>(array: T[]): T[];
function unique<T, K>(array: T[], keyGetter: (item: T) => K): T[];
function unique<T, K>(array: T[], keyGetter?: (item: T) => K): T[] {
  if (!keyGetter) {
    return [...new Set(array)];
  }

  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyGetter(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortBy<T>(array: T[], compareFn: (a: T, b: T) => number): T[] {
  return [...array].sort(compareFn);
}

interface ICollection<T> {
  add(item: T): this;
  remove(predicate: (item: T) => boolean): this;
  find(predicate: (item: T) => boolean): T | undefined;
  filter(predicate: (item: T) => boolean): Collection<T>;
  map<U>(mapper: (item: T) => U): Collection<U>;
  reduce<U>(reducer: (acc: U, item: T) => U, initialValue: U): U;
  toArray(): T[];
  readonly length: number;
}

class Collection<T> implements ICollection<T> {
  protected items: T[];

  constructor(items: T[] = []) {
    this.items = [...items];
  }

  add(item: T): this {
    this.items.push(item);
    return this;
  }

  remove(predicate: (item: T) => boolean): this {
    this.items = this.items.filter((item) => !predicate(item));
    return this;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  filter(predicate: (item: T) => boolean): Collection<T> {
    return new Collection(this.items.filter(predicate));
  }

  map<U>(mapper: (item: T) => U): Collection<U> {
    return new Collection(this.items.map(mapper));
  }

  reduce<U>(reducer: (acc: U, item: T) => U, initialValue: U): U {
    return this.items.reduce(reducer, initialValue);
  }

  toArray(): T[] {
    return [...this.items];
  }

  get length(): number {
    return this.items.length;
  }
}

interface Identifiable {
  id: number;
}

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

type Entity = Identifiable & Timestamped;

class Repository<T extends Entity> {
  private items: T[] = [];
  private nextId = 1;

  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): T {
    const item = {
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    } as T;

    this.items.push(item);
    return item;
  }

  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  findAll(): T[] {
    return [...this.items];
  }

  update(
    id: number,
    updates: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>
  ): T | null {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...this.items[index],
      ...updates,
      updatedAt: new Date(),
    } as T; // ← вот здесь говорим TS: "Доверяю, что T имеет эти поля"

    this.items[index] = updatedItem;
    return updatedItem;
  }

  delete(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }

  count(): number {
    return this.items.length;
  }
}

function merge<T extends object, U extends object>(
  target: T,
  ...sources: U[]
): T & U {
  return Object.assign({}, target, ...sources);
}

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as any;
  }

  const cloned = {} as any;
  Object.keys(obj).forEach((key) => {
    cloned[key] = deepClone((obj as any)[key]);
  });

  return cloned;
}

console.log("=== Тестирование Cache ===");
const cache = new Cache<string, { name: string; age: number }>();
cache.set("user:1", { name: "Анна", age: 25 });
console.log("Из кеша:", cache.get("user:1"));

console.log("\n=== Фильтрация и маппинг ===");
const numbers = [1, 2, 3, 4, 5];
const evenNumbers = filterArray(numbers, (n) => n % 2 === 0);
const doubled = mapArray(numbers, (n) => n * 2);
console.log("Чётные:", evenNumbers);
console.log("Удвоенные:", doubled);

console.log("\n=== Collection (chainable!) ===");
const users = new Collection([
  { name: "Анна", age: 25 },
  { name: "Петр", age: 30 },
  { name: "Мария", age: 22 },
])
  .filter((u) => u.age >= 25)
  .map((u) => ({ fullName: u.name + " (взрослый)" }));

console.log("Взрослые:", users.toArray());

console.log("\n=== Repository ===");
interface UserEntity extends Entity {
  name: string;
  email: string;
}

const userRepo = new Repository<UserEntity>();
const newUser = userRepo.create({ name: "Анна", email: "anna@example.com" });
console.log("Создан:", newUser);
console.log("Всего:", userRepo.count());
