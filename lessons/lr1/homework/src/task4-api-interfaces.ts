/*
 * ЗАДАЧА 4: Создание интерфейсов для API responses
 * 
 * Инструкции выполнены:
 * - добавлены интерфейсы для всех API ответов
 * - типизированы все функции работы с API
 * - обработаны состояния загрузки и ошибок
 */

// ========== Типы и интерфейсы ==========

// Универсальный тип API-ответа
interface ApiResponse<T> {
    success: boolean;
    data?: T | null;
    message?: string;
    error?: string | null;
}

// Роли пользователей
type UserRole = 'admin' | 'customer' | 'manager';

// Статусы заказов
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Пользователь
interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

// Товар
interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    images: string[];
    rating?: number;
}

// Элемент заказа
interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
}

// Заказ
interface Order {
    id: number;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
}

// Фильтры для получения товаров
interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
}

// ========== API функции ==========

// Дженерик-функция для выполнения запросов
async function makeApiRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
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
            data,
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

// Получение пользователя
async function getUser(userId: number): Promise<ApiResponse<User>> {
    return makeApiRequest<User>(`/api/users/${userId}`, { method: 'GET' });
}

// Получение списка товаров
async function getProducts(filters: ProductFilters): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();

    if (filters.category) queryParams.set('category', filters.category);
    if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.search) queryParams.set('search', filters.search);

    return makeApiRequest<Product[]>(`/api/products?${queryParams.toString()}`, {
        method: 'GET'
    });
}

// Создание заказа
async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<ApiResponse<Order>> {
    return makeApiRequest<Order>('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
}

// Обновление статуса заказа
async function updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<ApiResponse<Order>> {
    return makeApiRequest<Order>(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
}

// ========== Вспомогательные функции ==========

function handleApiResponse<T>(
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

// Управление состоянием загрузки
class ApiState<T> {
    isLoading = false;
    error: string | null = null;
    data: T | null = null;

    setLoading(loading: boolean) {
        this.isLoading = loading;
        if (loading) this.error = null;
    }

    setData(data: T) {
        this.data = data;
        this.isLoading = false;
        this.error = null;
    }

    setError(error: string) {
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

// Универсальная функция загрузки с состоянием
async function loadDataWithState<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    state: ApiState<T>
): Promise<ApiResponse<T>> {
    state.setLoading(true);

    try {
        const response = await apiCall();

        if (response.success && response.data) {
            state.setData(response.data);
        } else {
            state.setError(response.error || 'Ошибка запроса');
        }

        return response;
    } catch (error: any) {
        state.setError(error.message);
        return { success: false, error: error.message, data: null };
    }
}

// ========== Пример использования (демо) ==========

async function exampleUsage() {
    const userState = new ApiState<User>();
    const productsState = new ApiState<Product[]>();

    console.log('Загружаем пользователя...');
    await loadDataWithState(() => getUser(1), userState);
    console.log('Состояние пользователя:', userState.getState());

    console.log('Загружаем товары...');
    await loadDataWithState(() => getProducts({ category: 'electronics', minPrice: 1000 }), productsState);
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
        order => console.log('Заказ создан:', order),
        error => console.error('Ошибка создания заказа:', error)
    );
}

// Раскомментируй для теста (если есть реальное API)
// exampleUsage();
