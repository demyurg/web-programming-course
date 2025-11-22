type UserRole = "admin" | "customer" | "manager";
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

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
  createdAt: string; // ISO дата
}

// Generic ответ от API
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message?: string;
}

// Фильтры для товаров
interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

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
        data: null,
        error: data.message || "Произошла ошибка",
        message: data.message,
      };
    }

    return {
      success: true,
      data: data as T,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message ?? "Сетевая ошибка",
    };
  }
}

async function getUser(userId: number): Promise<ApiResponse<User>> {
  return makeApiRequest<User>(`/api/users/${userId}`, { method: "GET" });
}

async function getProducts(
  filters: ProductFilters = {}
): Promise<ApiResponse<Product[]>> {
  const queryParams = new URLSearchParams();

  if (filters.category) queryParams.set("category", filters.category);
  if (filters.minPrice)
    queryParams.set("minPrice", filters.minPrice.toString());
  if (filters.maxPrice)
    queryParams.set("maxPrice", filters.maxPrice.toString());
  if (filters.search) queryParams.set("search", filters.search);

  const url = `/api/products${queryParams.toString() ? `?${queryParams}` : ""}`;
  return makeApiRequest<Product[]>(url, { method: "GET" });
}

interface CreateOrderData {
  userId: number;
  items: OrderItem[];
  totalAmount: number;
}

async function createOrder(
  orderData: CreateOrderData
): Promise<ApiResponse<Order>> {
  return makeApiRequest<Order>("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
}

async function updateOrderStatus(
  orderId: number,
  newStatus: OrderStatus
): Promise<ApiResponse<Order>> {
  return makeApiRequest<Order>(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
}

function handleApiResponse<T>(
  response: ApiResponse<T>,
  onSuccess: (data: T) => void,
  onError: (error: string) => void
): void {
  if (response.success && response.data !== null) {
    onSuccess(response.data);
  } else {
    onError(response.error || "Неизвестная ошибка");
  }
}

class ApiState<T = unknown> {
  private isLoading: boolean = false;
  private error: string | null = null;
  private data: T | null = null;

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
      data: this.data,
    };
  }
}

async function loadDataWithState<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  state: ApiState<T>
): Promise<ApiResponse<T>> {
  state.setLoading(true);

  try {
    const response = await apiCall();

    if (response.success && response.data !== null) {
      state.setData(response.data);
    } else {
      state.setError(response.error || "Ошибка сервера");
    }

    return response;
  } catch (error: any) {
    state.setError(error.message ?? "Неизвестная ошибка");
    return {
      success: false,
      data: null,
      error: error.message ?? "Сетевая ошибка",
    };
  }
}

async function exampleUsage() {
  const userState = new ApiState<User>();
  const productsState = new ApiState<Product[]>();

  console.log("Загружаем пользователя...");
  await loadDataWithState(() => getUser(1), userState);
  console.log("Состояние пользователя:", userState.getState());

  console.log("Загружаем товары...");
  await loadDataWithState(
    () => getProducts({ category: "electronics", minPrice: 1000 }),
    productsState
  );
  console.log("Состояние товаров:", productsState.getState());

  console.log("Создаём заказ...");
  const orderResponse = await createOrder({
    userId: 1,
    items: [
      { productId: 101, quantity: 1, price: 1500 },
      { productId: 102, quantity: 2, price: 800 },
    ],
    totalAmount: 3100,
  });

  handleApiResponse(
    orderResponse,
    (order) => console.log("Заказ создан:", order),
    (error) => console.error("Ошибка создания заказа:", error)
  );
}

// Раскомментируй для запуска (без реального сервера будет ошибка сети — это нормально)
// exampleUsage();
