function processData(data: unknown[]): string[];
function processData(data: object): string[];
function processData(
  data: string | number | boolean | null | undefined
): string[];
function processData(data: unknown): string[] {
  if (Array.isArray(data)) {
    return data.map((item) => String(item));
  }

  if (data !== null && typeof data === "object") {
    return Object.entries(data).map(([key, value]) => `${key}: ${value}`);
  }

  return [String(data)];
}

type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}.${PathImpl<T[K], keyof T[K]> & string}` | K
    : K
  : never;

type Path<T> = PathImpl<T, keyof T> | keyof T;

type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

function getValue<T extends object, P extends string>(
  obj: T,
  path: P
): PathValue<T, P> | undefined {
  const keys = path.split(".") as string[];
  let current: any = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
}

interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  age?: number | null;
  avatar?: string | null;
}

function isValidUser(user: any): user is UserInput {
  return (
    typeof user?.firstName === "string" &&
    typeof user?.lastName === "string" &&
    typeof user?.email === "string"
  );
}

function formatUser(user: UserInput) {
  if (!isValidUser(user)) {
    throw new Error("Invalid user object");
  }

  return {
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email.toLowerCase(),
    age: user.age != null ? user.age : "Не указан",
    avatar: user.avatar ?? "/default-avatar.png",
  };
}

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.success) {
    console.log("Данные:", response.data);
    return response.data;
  } else {
    console.error("Ошибка:", response.error);
    throw new Error(response.error);
  }
}

function updateArray<T>(arr: readonly T[], index: number, newValue: T): T[] {
  if (index < 0 || index >= arr.length) {
    return [...arr];
  }
  return arr.map((item, i) => (i === index ? newValue : item));
}

type Listener = (...args: any[]) => void;

class EventEmitter<EventMap extends Record<string, any[]>> {
  private listeners: { [K in keyof EventMap]?: Listener[] } = {};

  on<K extends keyof EventMap>(
    event: K,
    callback: (...args: EventMap[K]) => void
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback as Listener);
  }

  emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]): void {
    if (this.listeners[event]) {
      this.listeners[event]!.forEach((cb) => cb(...args));
    }
  }

  off<K extends keyof EventMap>(
    event: K,
    callback: (...args: EventMap[K]) => void
  ): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event]!.filter(
        (cb) => cb !== callback
      );
    }
  }
}

async function fetchWithRetry<T>(
  url: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError!;
}

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  message?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

function validateForm(
  formData: Record<string, string>,
  rules: Record<string, ValidationRule>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const field in rules) {
    const value = formData[field] ?? "";
    const rule = rules[field]; // ← тут rule может быть undefined

    // Защищаем все обращения к rule через optional chaining + nullish coalescing
    if (rule?.required && (!value || value.trim() === "")) {
      errors[field] = "Поле обязательно для заполнения";
      continue;
    }

    if (
      value &&
      rule?.minLength !== undefined &&
      value.length < rule.minLength
    ) {
      errors[field] = `Минимальная длина: ${rule.minLength} символов`;
      continue;
    }

    if (value && rule?.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message ?? "Неверный формат";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;

  if (typeof a === "object" && typeof b === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, i) => isEqual(item, b[i]));
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(
      (key) => key in b && isEqual((a as any)[key], (b as any)[key])
    );
  }

  return false;
}

console.log("=== processData ===");
console.log(processData([1, 2, 3]));
console.log(processData({ a: 1, b: 2 }));
console.log(processData("hello"));

console.log("\n=== getValue ===");
const testObj = { user: { profile: { name: "Анна" } } };
console.log(getValue(testObj, "user.profile.name"));
console.log(getValue(testObj, "user.nonexistent"));

console.log("\n=== EventEmitter ===");
const emitter = new EventEmitter<{ test: [string] }>();
emitter.on("test", (message) => console.log("Получено:", message));
emitter.emit("test", "Привет!");

console.log("\n=== pick ===");
const user = {
  name: "Анна",
  age: 25,
  email: "anna@example.com",
  password: "secret",
};
const publicData = pick(user, ["name", "age", "email"]);
console.log("Публичные данные:", publicData);
