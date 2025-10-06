"use strict";
/*
 * ЗАДАЧА 4: Создание интерфейсов для API responses
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Создайте интерфейсы для всех API ответов
 * 3. Типизируйте все функции работы с API
 * 4. Обработайте все возможные состояния загрузки и ошибок
 */
Object.defineProperty(exports, "__esModule", { value: true });
async function makeApiRequest(url, options) {
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
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}
async function getUser(userId) {
    return makeApiRequest(`/api/users/${userId}`, {
        method: 'GET',
    });
}
async function getProducts(filters) {
    const queryParams = new URLSearchParams();
    if (filters.category)
        queryParams.set('category', filters.category);
    if (filters.minPrice)
        queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice)
        queryParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.search)
        queryParams.set('search', filters.search);
    return makeApiRequest(`/api/products?${queryParams}`, {
        method: 'GET',
    });
}
async function createOrder(orderData) {
    return makeApiRequest('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    });
}
async function updateOrderStatus(orderId, newStatus) {
    return makeApiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
    });
}
function handleApiResponse(response, onSuccess, onError) {
    if (response.success && response.data !== undefined) {
        onSuccess(response.data);
    }
    else {
        onError(response.error || 'Неизвестная ошибка');
    }
}
class ApiState {
    isLoading;
    error;
    data;
    constructor() {
        this.isLoading = false;
        this.error = null;
        this.data = null;
    }
    setLoading(loading) {
        this.isLoading = loading;
        if (loading) {
            this.error = null;
        }
    }
    setData(data) {
        this.data = data;
        this.isLoading = false;
        this.error = null;
    }
    setError(error) {
        this.error = error;
        this.isLoading = false;
        this.data = null;
    }
    getState() {
        return {
            isLoading: this.isLoading,
            error: this.error,
            data: this.data,
        };
    }
}
async function loadDataWithState(apiCall, state) {
    state.setLoading(true);
    try {
        const response = await apiCall();
        if (response.success && response.data !== undefined) {
            state.setData(response.data);
        }
        else {
            state.setError(response.error || 'Неизвестная ошибка');
        }
        return response;
    }
    catch (error) {
        const errorMessage = error.message;
        state.setError(errorMessage);
        return {
            success: false,
            error: errorMessage,
        };
    }
}
async function exampleUsage() {
    const userState = new ApiState();
    const productsState = new ApiState();
    console.log('Загружаем пользователя...');
    await loadDataWithState(() => getUser(1), userState);
    console.log('Состояние пользователя:', userState.getState());
    console.log('Загружаем товары...');
    await loadDataWithState(() => getProducts({
        category: 'electronics',
        minPrice: 1000,
    }), productsState);
    console.log('Состояние товаров:', productsState.getState());
    console.log('Создаем заказ...');
    const orderData = {
        userId: 1,
        items: [
            { productId: 101, quantity: 1, price: 1500 },
            { productId: 102, quantity: 2, price: 800 },
        ],
        totalAmount: 3100,
    };
    const orderResponse = await createOrder(orderData);
    handleApiResponse(orderResponse, (order) => console.log('Заказ создан:', order), error => console.error('Ошибка создания заказа:', error));
}
exampleUsage();
//# sourceMappingURL=task4-api-interfaces.js.map