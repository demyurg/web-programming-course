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
interface ApiResponse<T> {
    data?: T;
    success: boolean;
    message?: string;
    error?: string | null;
}

type UserRole = 'admin' | 'customer' | 'manager';
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type ProductCategory = 'electronics' | 'clothing' | 'books' | 'food' | 'other';

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
    category: ProductCategory;
    images: string[];
    rating?: number;
}

interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
}

interface Order {
    id: number,
    userId: number,
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
}

// enum OrderStatus {
//     pending,
//     processing,
//     shipped,
//     delivered,
//     cancelled
// }
// enum category {
//     electronics,
//     clothing,
//     books,
//     food,
//     other
// }
interface ProductFilters {
    category?: ProductCategory;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
    tag?: string;
    search?: string;
}

// Базовая функция для API запросов
async function makeApiRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>>{
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Произошла ошибка',
            };
        }
        
        return {
            success: true,
            data: data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message ?? 'UNKNOWN ERROR',
        };
    }
}

// Получение пользователя по ID
async function getUser(userId: number): Promise<ApiResponse<User>> {
    return makeApiRequest<User>(`/api/users/${userId}`, {
        method: 'GET'
    });
}

// Получение списка товаров с фильтрами
async function getProducts(filters: ProductFilters): Promise<ApiResponse<Product[]>>{
    const queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.set('category', String(filters.category));
    if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.search) queryParams.set('search', filters.search);
    
    return makeApiRequest<Product[]>(`/api/products?${queryParams}`, {
        method: 'GET'
    });
}

// Создание заказа
async function createOrder(orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    return makeApiRequest<Order>('/api/orders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(orderData)
    });
}

// Обновление статуса заказа
async function updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<ApiResponse<Order>> {
    return makeApiRequest<Order>(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: newStatus })
    });
}

// Функция для обработки результатов API
function handleApiResponse<T>(response: ApiResponse<T>, onSuccess: (data: T) => void, onError: (error: string) => void)
{
    if (response.success && response.data) {
        onSuccess(response.data);
    } else {
        onError(response.error || 'Неизвестная ошибка');
    }
}

// Класс для управления состоянием загрузки
class ApiState<T> {
    private isLoading = false;
    private error: string | null = null;
    private data: T | null = null ;
    
    setLoading(loading: boolean) {
        this.isLoading = loading;
        if (loading) {
            this.error = null;
        }
    }
    
    setData(data: T) {
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
async function loadDataWithState<T>(apiCall: () => Promise<ApiResponse<T>>, state: ApiState<T>): Promise<ApiResponse<T>> {
    state.setLoading(true);
    
    try {
        const response = await apiCall();
        
        if (response.success && response.data) {
            state.setData(response.data);
        } else {
            state.setError(response.error ?? "LOADING ERROR");
        }
        
        return response;
    } catch (error: any) {
        state.setError(error.message);
        return {
            success: false,
            error: error.message,
        };
    }
}

// Примеры использования
async function exampleUsage() {
    const userState = new ApiState<User>();
    const productsState = new ApiState<Product[]>();
    
    console.log('Загружаем пользователя...');
    await loadDataWithState(() => getUser(1), userState);
    console.log('Состояние пользователя:', userState.getState());
    
    console.log('Загружаем товары...');
    await loadDataWithState(() => getProducts({ 
        category: 'electronics', 
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
        totalAmount: 3100,
        status: 'pending',
        createdAt: new Date().toISOString(), //тек.дата
    });
    
    handleApiResponse(
        orderResponse,
        (order) => console.log('Заказ создан:', order),
        (error) => console.error('Ошибка создания заказа:', error)
    );
}

// Раскомментируйте для тестирования (не будет работать без реального API)
// exampleUsage();