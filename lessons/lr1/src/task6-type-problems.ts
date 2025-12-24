/*
 * ЗАДАЧА 6: Решение типовых проблем типизации
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Исправьте все проблемы с типизацией
 * 3. Используйте type guards, utility types и другие продвинутые возможности
 * 4. Добавьте proper обработку ошибок и edge cases
 */

// Проблемные функции, которые нужно исправить

// ПРОБЛЕМА 1: Функция с any типом
function processData(data: unknown): string[] {
    if (Array.isArray(data)) {
     return data.map(item => String(item))
    }
   
    if (typeof data === 'object' && data !== null) {
     return Object.keys(data).map(
      key => `${key}: ${String((data as Record<string, unknown>)[key])}`,
     )
    }
   
    return [String(data)]
   }
   
   // ПРОБЛЕМА 2: Функция с неопределенными возвращаемыми типами
   function getValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.')
    let current: unknown = obj
   
    for (const key of keys) {
     if (typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key]
     } else {
      return undefined
     }
    }
   
    return current
   }
   
   // ПРОБЛЕМА 3: Функция с проблемами null/undefined
   
   type User = {
    firstName?: string
    lastName?: string
    email?: string
    age?: number
    avatar?: string
   }
   
   function formatUser(user: User | null | undefined): {
    fullName: string
    email: string
    age: string
    avatar: string
   } {
    if (!user) {
     return {
      fullName: 'Гость',
      email: 'Не указан',
      age: 'Не указан',
      avatar: '/default-avatar.png',
     }
    }
   
    const firstName = user.firstName ?? ''
    const lastName = user.lastName ?? ''
    const fullName = `${firstName} ${lastName}`.trim()
   
    return {
     fullName: fullName || 'Безымянный',
     email: user.email?.toLowerCase() ?? 'Не указан',
     age: user.age != null ? String(user.age) : 'Не указан',
     avatar: user.avatar || '/default-avatar.png',
    }
   }
   
   // ПРОБЛЕМА 4: Функция с union типами без type guards
   
   type SuccessResponse<T> = {
    success: true
    data: T
   }
   
   type ErrorResponse = {
    success: false
    error: string
   }
   
   type ApiResponse<T> = SuccessResponse<T> | ErrorResponse
   
   function handleResponse<T>(response: ApiResponse<T>): T {
    if (response.success) {
     console.log('Данные:', response.data)
     return response.data
    } else {
     console.error('Ошибка:', response.error)
     throw new Error(response.error)
    }
   }
   
   // ПРОБЛЕМА 5: Функция с проблемами мутации
   function updateArray<T>(arr: readonly T[], index: number, newValue: T): T[] {
    if (index < 0 || index >= arr.length) {
     return [...arr]
    }
    return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)]
   }
   
   // ПРОБЛЕМА 6: Класс с неправильной типизацией событий
   
   type ListenerCallback<T extends unknown[]> = (...args: T) => void
   
   class EventEmitter<EventMap extends Record<string, unknown[]>> {
    private listeners: {
     [K in keyof EventMap]?: ListenerCallback<EventMap[K]>[]
    } = {}
   
    constructor() {
     this.listeners = {}
    }
   
    on<K extends keyof EventMap>(
     event: K,
     callback: ListenerCallback<EventMap[K]>,
    ) {
     if (!this.listeners[event]) {
      this.listeners[event] = []
     }
     this.listeners[event]!.push(callback)
    }
   
    emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]) {
     if (this.listeners[event]) {
      this.listeners[event]!.forEach(callback => callback(...args))
     }
    }
   
    off<K extends keyof EventMap>(
     event: K,
     callback: ListenerCallback<EventMap[K]>,
    ) {
     if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event]!.filter(
       cb => cb !== callback,
      )
     }
    }
   }
   
   // ПРОБЛЕМА 7: Функция с проблемами асинхронности
   async function fetchWithRetry<T>(url: string, maxRetries: number): Promise<T> {
    let lastError: Error | undefined
   
    for (let i = 0; i < maxRetries; i++) {
     try {
      const response = await fetch(url)
      if (!response.ok) {
       throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return (await response.json()) as T
     } catch (error) {
      lastError = error instanceof Error ? error : new
   
   
   Error(String(error))
      if (i < maxRetries - 1) {
       await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
     }
    }
   
    throw (
     lastError ??
     new Error('Не удалось выполнить запрос после нескольких попыток.')
    )
   }
   
   // ПРОБЛЕМА 8: Функция валидации с проблемами типов
   type ValidationRule = {
    required?: boolean
    minLength?: number
    pattern?: RegExp
    message?: string
   }
   
   type ValidationRules<T> = {
    [K in keyof T]?: ValidationRule
   }
   
   type ValidationErrors<T> = {
    [K in keyof T]?: string
   }
   
   type ValidationResult<T> = {
    isValid: boolean
    errors: ValidationErrors<T>
   }
   
   function validateForm<T extends Record<string, string | undefined>>(
    formData: T,
    rules: ValidationRules<T>,
   ): ValidationResult<T> {
    const errors: ValidationErrors<T> = {}
   
    for (const field in rules) {
     const key = field as keyof T
     const value = formData[key]
     const rule = rules[key]
   
     if (!rule) continue
   
     if (rule.required && (!value || value.trim() === '')) {
      errors[key] = 'Поле обязательно для заполнения'
      continue
     }
   
     if (value && rule.minLength && value.length < rule.minLength) {
      errors[key] = `Минимальная длина: ${rule.minLength} символов`
      continue
     }
   
     if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[key] = rule.message || 'Неверный формат'
     }
    }
   
    return {
     isValid: Object.keys(errors).length === 0,
     errors,
    }
   }
   
   // ПРОБЛЕМА 9: Утилитарная функция с проблемами типов
   function pick<T extends object, K extends keyof T>(
    obj: T,
    keys: readonly K[],
   ): Pick<T, K> {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
     if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key]
     }
    })
    return result
   }
   
   // ПРОБЛЕМА 10: Функция сравнения с проблемами типов
   function isEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true
   
    if (
     a === null ||
     typeof a !== 'object' ||
     b === null ||
     typeof b !== 'object'
    ) {
     return false
    }
   
    const objA = a as Record<string, unknown>
    const objB = b as Record<string, unknown>
    const keysA = Object.keys(objA)
    const keysB = Object.keys(objB)
   
    if (keysA.length !== keysB.length) return false
   
    for (const key of keysA) {
     if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !isEqual(objA[key], objB[key])
     ) {
      return false
     }
    }
   
    return true
   }
   
   // Примеры использования (должны работать после исправления типизации)
   console.log('=== Тестирование processData ===')
   console.log(processData([1, 2, 3]))
   console.log(processData({ a: 1, b: 2 }))
   console.log(processData('hello'))
   
   console.log('\n=== Тестирование getValue ===')
   const testObj = { user: { profile: { name: 'Анна' } } }
   console.log(getValue(testObj, 'user.profile.name'))
   console.log(getValue(testObj, 'user.nonexistent'))
   
   console.log('\n=== Тестирование EventEmitter ===')
   type AppEvents = {
    test: [message: string]
    userLogin: [userId: number, name: string]
   }
   
   const emitter = new EventEmitter<AppEvents>()
   emitter.on('test', message => console.log('Получено:', message))
   emitter.emit('test', 'Привет!')
   
   console.log('\n=== Тестирование pick ===')
   const user = {
    name: 'Анна',
    age: 25,
    email: 'anna@example.com',
    password: 'secret',
   }
   const publicData = pick(user, ['name', 'age', 'email'])
   console.log('Публичные данные:', publicData)