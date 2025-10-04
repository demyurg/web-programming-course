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

type UserRole = 'admin' | 'customer' | 'manager';
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface ApiResponse {
    success: boolean;
    data?: any;
    error?: string | null;
    message?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    images: string[];
    rating?: number;
}

interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
}
// Базовая функция для API запросов
async function makeApiRequest(url: string, options: RequestInit): Promise<ApiResponse> {
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
            data: data,
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

// Получение пользователя по ID
async function getUser(userId: number): Promise<ApiResponse> {
    return makeApiRequest(`/api/users/${userId}`, { 
        method: 'GET'
    });
}

type ProductFilters = {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
};

// Получение списка товаров с фильтрами

async function getProducts(filters: ProductFilters): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();

    if (filters.category) queryParams.set('category', filters.category);
    if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.search) queryParams.set('search', filters.search);

    return makeApiRequest(`/api/products?${queryParams}`, {
        method: 'GET'
    });
}

// Создание заказа

async function createOrder(orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<ApiResponse> {
    return makeApiRequest('/api/orders', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(orderData)
    });
}

// Обновление статуса заказа

async function updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<ApiResponse> {
    return makeApiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus })
    });
}

// Функция для обработки результатов API

function handleApiResponse(response: ApiResponse, onSuccess: (data: any) => void, onError: (err: string) => void): void {
    if (response.success && response.data) {
        onSuccess(response.data);
    } else {
        onError(response.error || 'Неизвестная ошибка');
    }
}