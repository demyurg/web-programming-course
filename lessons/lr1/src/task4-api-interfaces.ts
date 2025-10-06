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

// Базовая функция для API запросов

interface ApiResponse<T> {
    data?: T|null;
    success: boolean;
    error?: string|null;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    images: string[];
}

interface Order {
    id: number;
    userId: number;
    items: {
        productId: number;
        quantity: number;
        price: number;
    }[]
    totalAmount: number;
}

interface OrderItem {
    product: Product;
}

enum UserRole {
    Admin = 'admin',
    Customer = 'customer',
    Manager = 'manager'
}

enum category {
    electronics,
    clothing,
    books,
    food,
    other
}

enum OrderStatus {
    Pending = 'pending',
    Processing = 'processing',
    Shipped = 'shipped',
    Delivered = 'delivered',
    Cancelled = 'cancelled'
}

async function makeApiRequest(url: string, options?: RequestInit) {
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
            error: error.message ?? 'unknown error',
            data: null
        };
    }
}

// Получение пользователя по ID
async function getUser(userId: number) {
    return makeApiRequest(`/api/users/${userId}`, {
        method: 'GET'
    });
}

interface filters{
    category?: category,
    inStock?: boolean,
    minPrice?: number,
    maxPrice?: number,
    tag?:  string,
    search?: string
}

// Получение списка товаров с фильтрами
async function getProducts(filters: filters) {
    const queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.set('category', String(filters.category));
    if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.search) queryParams.set('search', filters.search);
    
    return makeApiRequest(`/api/products?${queryParams}`, {
        method: 'GET'
    });
}

// Создание заказа
async function createOrder(orderData: Partial<Order>) {
    return makeApiRequest('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });
}

// Обновление статуса заказа
async function updateOrderStatus(orderId: number, newStatus: OrderStatus) {
    return makeApiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    });
}

// Функция для обработки результатов API
function handleApiResponse(response: ApiResponse<Order>, onSuccess: Function, onError: Function) {
    if (response.success && response.data) {
        onSuccess(response.data);
    } else {
        onError(response.error || 'Неизвестная ошибка');
    }
}

// Класс для управления состоянием загрузки
class ApiState {
    private isLoading: boolean;
    private error: string | null;
    private data: any;

    public constructor() {
        this.isLoading = false;
        this.error = null;
        this.data = null;
    }
    
    setLoading(loading: boolean) {
        this.isLoading = loading;
        if (loading) {
            this.error = null;
        }
    }
    
    setData(data: any) {
        this.data = data;
        this.isLoading = false;
        this.error = null;
    }
    
    setError(error: string|null) {
        this.error = error;
        this.isLoading = false;
        this.data = null;
    }
    
    getState() {
        return {
            isLoading: this.isLoading,
            error: this.error,
            data: this.data
        };
    }
}

// Композитная функция для загрузки данных с состоянием
async function loadDataWithState(apiCall: Function, state: ApiState) {
    state.setLoading(true);
    
    try {
        const response = await apiCall();
        
        if (response.success) {
            state.setData(response.data);
        } else {
            state.setError(response.error);
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

// Примеры использования
async function exampleUsage() {
    const userState = new ApiState();
    const productsState = new ApiState();
    
    console.log('Загружаем пользователя...');
    await loadDataWithState(() => getUser(1), userState);
    console.log('Состояние пользователя:', userState.getState());
    
    console.log('Загружаем товары...');
    await loadDataWithState(() => getProducts({ 
        category: category.electronics, 
        minPrice: 1000 
    }), productsState);
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
        (order: Order) => console.log('Заказ создан:', order),
        (error: string|null) => console.error('Ошибка создания заказа:', error)
    );
}

// Раскомментируйте для тестирования (не будет работать без реального API)
// exampleUsage();