/*
 * ЗАДАЧА 4: Создание интерфейсов для API responses
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Создайте интерфейсы для всех API ответов
 * 3. Типизируйте все функции работы с API
 * 4. Обработайте все возможные состояния загрузки и ошибок
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function makeApiRequest(url, options) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(url, options)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok) {
                        return [2 /*return*/, {
                                success: false,
                                error: data.message || 'Произошла ошибка',
                            }];
                    }
                    return [2 /*return*/, {
                            success: true,
                            data: data,
                        }];
                case 3:
                    error_1 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: error_1.message,
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getUser(userId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, makeApiRequest("/api/users/".concat(userId), {
                    method: 'GET',
                })];
        });
    });
}
function getProducts(filters) {
    return __awaiter(this, void 0, void 0, function () {
        var queryParams;
        return __generator(this, function (_a) {
            queryParams = new URLSearchParams();
            if (filters.category)
                queryParams.set('category', filters.category);
            if (filters.minPrice)
                queryParams.set('minPrice', filters.minPrice.toString());
            if (filters.maxPrice)
                queryParams.set('maxPrice', filters.maxPrice.toString());
            if (filters.search)
                queryParams.set('search', filters.search);
            return [2 /*return*/, makeApiRequest("/api/products?".concat(queryParams), {
                    method: 'GET',
                })];
        });
    });
}
function createOrder(orderData) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, makeApiRequest('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                })];
        });
    });
}
function updateOrderStatus(orderId, newStatus) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, makeApiRequest("/api/orders/".concat(orderId, "/status"), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus }),
                })];
        });
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
var ApiState = /** @class */ (function () {
    function ApiState() {
        this.isLoading = false;
        this.error = null;
        this.data = null;
    }
    ApiState.prototype.setLoading = function (loading) {
        this.isLoading = loading;
        if (loading) {
            this.error = null;
        }
    };
    ApiState.prototype.setData = function (data) {
        this.data = data;
        this.isLoading = false;
        this.error = null;
    };
    ApiState.prototype.setError = function (error) {
        this.error = error;
        this.isLoading = false;
        this.data = null;
    };
    ApiState.prototype.getState = function () {
        return {
            isLoading: this.isLoading,
            error: this.error,
            data: this.data,
        };
    };
    return ApiState;
}());
function loadDataWithState(apiCall, state) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state.setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, apiCall()];
                case 2:
                    response = _a.sent();
                    if (response.success && response.data !== undefined) {
                        state.setData(response.data);
                    }
                    else {
                        state.setError(response.error || 'Неизвестная ошибка');
                    }
                    return [2 /*return*/, response];
                case 3:
                    error_2 = _a.sent();
                    errorMessage = error_2.message;
                    state.setError(errorMessage);
                    return [2 /*return*/, {
                            success: false,
                            error: errorMessage,
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function exampleUsage() {
    return __awaiter(this, void 0, void 0, function () {
        var userState, productsState, orderData, orderResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userState = new ApiState();
                    productsState = new ApiState();
                    console.log('Загружаем пользователя...');
                    return [4 /*yield*/, loadDataWithState(function () { return getUser(1); }, userState)];
                case 1:
                    _a.sent();
                    console.log('Состояние пользователя:', userState.getState());
                    console.log('Загружаем товары...');
                    return [4 /*yield*/, loadDataWithState(function () {
                            return getProducts({
                                category: 'electronics',
                                minPrice: 1000,
                            });
                        }, productsState)];
                case 2:
                    _a.sent();
                    console.log('Состояние товаров:', productsState.getState());
                    console.log('Создаем заказ...');
                    orderData = {
                        userId: 1,
                        items: [
                            { productId: 101, quantity: 1, price: 1500 },
                            { productId: 102, quantity: 2, price: 800 },
                        ],
                        totalAmount: 3100,
                    };
                    return [4 /*yield*/, createOrder(orderData)];
                case 3:
                    orderResponse = _a.sent();
                    handleApiResponse(orderResponse, function (order) { return console.log('Заказ создан:', order); }, function (error) { return console.error('Ошибка создания заказа:', error); });
                    return [2 /*return*/];
            }
        });
    });
}
exampleUsage();
