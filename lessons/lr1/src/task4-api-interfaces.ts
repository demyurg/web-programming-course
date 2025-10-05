/*
 * ЗАДАЧА 4: Создание интерфейсов для API responses
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Создайте интерфейсы для всех API ответов
 * 3. Типизируйте все функции работы с API
 * 4. Обработайте все возможные состояния загрузки и ошибок
 */

// Система работы с API интернет-магазина

// TODO: Создать интерфейсы для API ответов:
// - ApiResponse<T>: data?, success, message?, error?
// - User: id, name, email, role, avatar?
// - Product: id, name, price, description, category, images[], rating?
// - Order: id, userId, items[], totalAmount, status, createdAt
// - OrderItem: productId, quantity, price

// TODO: Создать union типы:
// - UserRole: 'admin' | 'customer' | 'manager'
// - OrderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

<<<<<<< Updated upstream
<<<<<<< Updated upstream

// Обёртка ответа API
 interface ApiResponse<T> {
=======
// Обёртка ответа API
export interface ApiResponse<T> {
>>>>>>> Stashed changes
=======
// Обёртка ответа API
export interface ApiResponse<T> {
>>>>>>> Stashed changes
    success: boolean;
    data?: T | null;
    message?: string;
    error?: string | null;
}

// Роли пользователей
<<<<<<< Updated upstream
<<<<<<< Updated upstream
 type UserRole = 'admin' | 'customer' | 'manager';

// Статусы заказов
 type OrderStatus =
=======
=======
>>>>>>> Stashed changes
export type UserRole = 'admin' | 'customer' | 'manager';

// Статусы заказов
export type OrderStatus =
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

// Пользователь
<<<<<<< Updated upstream
<<<<<<< Updated upstream
 interface User {
=======
export interface User {
>>>>>>> Stashed changes
=======
export interface User {
>>>>>>> Stashed changes
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

// Товар
<<<<<<< Updated upstream
<<<<<<< Updated upstream
 interface Product {
=======
export interface Product {
>>>>>>> Stashed changes
=======
export interface Product {
>>>>>>> Stashed changes
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    images: string[];
    rating?: number;
}

// Позиция заказа
<<<<<<< Updated upstream
<<<<<<< Updated upstream
 interface OrderItem {
=======
export interface OrderItem {
>>>>>>> Stashed changes
=======
export interface OrderItem {
>>>>>>> Stashed changes
    productId: number;
    quantity: number;
    price: number;
}

// Заказ
<<<<<<< Updated upstream
<<<<<<< Updated upstream
 interface Order {
=======
export interface Order {
>>>>>>> Stashed changes
=======
export interface Order {
>>>>>>> Stashed changes
    id: number;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
}

// Параметры фильтрации для списка товаров
<<<<<<< Updated upstream
<<<<<<< Updated upstream
 interface ProductFilters {
=======
export interface ProductFilters {
>>>>>>> Stashed changes
=======
export interface ProductFilters {
>>>>>>> Stashed changes
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Универсальная функция API 
=======
// ===== Универсальная функция API =====
>>>>>>> Stashed changes
=======
// ===== Универсальная функция API =====
>>>>>>> Stashed changes

async function makeApiRequest<T>(
    url: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Произошла ошибка',
                data: null
            };
        }

        return {
            success: true,
            data: data as T,
            error: null
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// API функции

async function getUser(userId: number): Promise<ApiResponse<User>> {
    return makeApiRequest<User>(`/api/users/${userId}`, { method: 'GET' });
}

async function getProducts(filters: ProductFilters): Promise<ApiResponse<Product[]>> {
=======
=======
>>>>>>> Stashed changes
// ===== API функции =====

export async function getUser(userId: number): Promise<ApiResponse<User>> {
    return makeApiRequest<User>(`/api/users/${userId}`, { method: 'GET' });
}

export async function getProducts(filters: ProductFilters): Promise<ApiResponse<Product[]>> {
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    const queryParams = new URLSearchParams();

    if (filters.category) queryParams.set('category', filters.category);
    if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.search) queryParams.set('search', filters.search);

    return makeApiRequest<Product[]>(`/api/products?${queryParams}`, { method: 'GET' });
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
async function createOrder(orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<ApiResponse<Order>> {
=======
export async function createOrder(orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<ApiResponse<Order>> {
>>>>>>> Stashed changes
=======
export async function createOrder(orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<ApiResponse<Order>> {
>>>>>>> Stashed changes
    return makeApiRequest<Order>('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
async function updateOrderStatus(
=======
export async function updateOrderStatus(
>>>>>>> Stashed changes
=======
export async function updateOrderStatus(
>>>>>>> Stashed changes
    orderId: number,
    newStatus: OrderStatus
): Promise<ApiResponse<Order>> {
    return makeApiRequest<Order>(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Вспомогательные функции

function handleApiResponse<T>(
=======
// ===== Вспомогательные функции =====

export function handleApiResponse<T>(
>>>>>>> Stashed changes
=======
// ===== Вспомогательные функции =====

export function handleApiResponse<T>(
>>>>>>> Stashed changes
    response: ApiResponse<T>,
    onSuccess: (data: T) => void,
    onError: (error: string) => void
): void {
    if (response.success && response.data) {
        onSuccess(response.data);
    } else {
        onError(response.error || 'Неизвестная ошибка');
    }
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Класс состояния

class ApiState<T> {
=======
// ===== Класс состояния =====

export class ApiState<T> {
>>>>>>> Stashed changes
=======
// ===== Класс состояния =====

export class ApiState<T> {
>>>>>>> Stashed changes
    isLoading: boolean;
    error: string | null;
    data: T | null;

    constructor() {
        this.isLoading = false;
        this.error = null;
        this.data = null;
    }

    setLoading(loading: boolean): void {
        this.isLoading = loading;
        if (loading) this.error = null;
    }

    setData(data: T): void {
        this.data = data;
        this.isLoading = false;
        this.error = null;
    }

    setError(error: string): void {
        this.error = error;
        this.isLoading = false;
        this.data = null;
    }

    getState(): { isLoading: boolean; error: string | null; data: T | null } {
        return {
            isLoading: this.isLoading,
            error: this.error,
            data: this.data
        };
    }
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Композитная функция

async function loadDataWithState<T>(
=======
// ===== Композитная функция =====

export async function loadDataWithState<T>(
>>>>>>> Stashed changes
=======
// ===== Композитная функция =====

export async function loadDataWithState<T>(
>>>>>>> Stashed changes
    apiCall: () => Promise<ApiResponse<T>>,
    state: ApiState<T>
): Promise<ApiResponse<T>> {
    state.setLoading(true);

    try {
        const response = await apiCall();

        if (response.success && response.data) {
            state.setData(response.data);
        } else {
            state.setError(response.error || 'Ошибка загрузки');
        }

        return response;
    } catch (error: any) {
        state.setError(error.message);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Пример использования 

async function exampleUsage(): Promise<void> {
=======
// ===== Пример использования =====

export async function exampleUsage(): Promise<void> {
>>>>>>> Stashed changes
=======
// ===== Пример использования =====

export async function exampleUsage(): Promise<void> {
>>>>>>> Stashed changes
    const userState = new ApiState<User>();
    const productsState = new ApiState<Product[]>();

    console.log('Загружаем пользователя...');
    await loadDataWithState(() => getUser(1), userState);
    console.log('Состояние пользователя:', userState.getState());

    console.log('Загружаем товары...');
    await loadDataWithState(() =>
        getProducts({ category: 'electronics', minPrice: 1000 }),
        productsState
    );
    console.log('Состояние товаров:', productsState.getState());

    console.log('Создаем заказ...');
    const orderResponse = await createOrder({
        userId: 1,
        items: [
            { productId: 101, quantity: 1, price: 1500 },
            { productId: 102, quantity: 2, price: 800 }
        ],
        totalAmount: 3100
    });

    handleApiResponse(
        orderResponse,
        (order) => console.log('✅ Заказ создан:', order),
        (error) => console.error('❌ Ошибка создания заказа:', error)
    );
}

<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
// Раскомментируйте для тестирования (не будет работать без реального API)
exampleUsage();