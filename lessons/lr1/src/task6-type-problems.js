/*
 * ЗАДАЧА 6: Решение типовых проблем типизации
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Исправьте все проблемы с типизацией
 * 3. Используйте type guards, utility types и другие продвинутые возможности
 * 4. Добавьте proper обработку ошибок и edge cases
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// Проблемные функции, которые нужно исправить
function processData(data) {
    if (Array.isArray(data)) {
        return data.map(function (item) { return String(item); });
    }
    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).map(function (key) { return "".concat(key, ": ").concat(String(data[key])); });
    }
    return [String(data)];
}
function getValue(obj, path) {
    var keys = path.split('.');
    var current = obj;
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        if (typeof current === 'object' && current !== null && key in current) {
            current = current[key];
        }
        else {
            return undefined;
        }
    }
    return current;
}
function formatUser(user) {
    var _a, _b, _c, _d;
    if (!user) {
        return {
            fullName: 'Гость',
            email: 'Не указан',
            age: 'Не указан',
            avatar: '/default-avatar.png',
        };
    }
    var firstName = (_a = user.firstName) !== null && _a !== void 0 ? _a : '';
    var lastName = (_b = user.lastName) !== null && _b !== void 0 ? _b : '';
    var fullName = "".concat(firstName, " ").concat(lastName).trim();
    return {
        fullName: fullName || 'Безымянный',
        email: (_d = (_c = user.email) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : 'Не указан',
        age: user.age != null ? String(user.age) : 'Не указан',
        avatar: user.avatar || '/default-avatar.png',
    };
}
function handleResponse(response) {
    if (response.success) {
        console.log('Данные:', response.data);
        return response.data;
    }
    else {
        console.error('Ошибка:', response.error);
        throw new Error(response.error);
    }
}
function updateArray(arr, index, newValue) {
    if (index < 0 || index >= arr.length) {
        return __spreadArray([], arr, true);
    }
    return __spreadArray(__spreadArray(__spreadArray([], arr.slice(0, index), true), [newValue], false), arr.slice(index + 1), true);
}
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.listeners = {};
        this.listeners = {};
    }
    EventEmitter.prototype.on = function (event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    };
    EventEmitter.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.listeners[event]) {
            this.listeners[event].forEach(function (callback) { return callback.apply(void 0, args); });
        }
    };
    EventEmitter.prototype.off = function (event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(function (cb) { return cb !== callback; });
        }
    };
    return EventEmitter;
}());
function fetchWithRetry(url, maxRetries) {
    return __awaiter(this, void 0, void 0, function () {
        var lastError, _loop_1, i, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (i) {
                        var response, _b, error_1;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 3, , 6]);
                                    return [4 /*yield*/, fetch(url)];
                                case 1:
                                    response = _c.sent();
                                    if (!response.ok) {
                                        throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                                    }
                                    _b = {};
                                    return [4 /*yield*/, response.json()];
                                case 2: return [2 /*return*/, (_b.value = (_c.sent()), _b)];
                                case 3:
                                    error_1 = _c.sent();
                                    lastError = error_1 instanceof Error ? error_1 : new Error(String(error_1));
                                    if (!(i < maxRetries - 1)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000 * (i + 1)); })];
                                case 4:
                                    _c.sent();
                                    _c.label = 5;
                                case 5: return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < maxRetries)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: throw (lastError !== null && lastError !== void 0 ? lastError : new Error('Не удалось выполнить запрос после нескольких попыток.'));
            }
        });
    });
}
function validateForm(formData, rules) {
    var errors = {};
    for (var field in rules) {
        var key = field;
        var value = formData[key];
        var rule = rules[key];
        if (!rule)
            continue;
        if (rule.required && (!value || value.trim() === '')) {
            errors[key] = 'Поле обязательно для заполнения';
            continue;
        }
        if (value && rule.minLength && value.length < rule.minLength) {
            errors[key] = "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0434\u043B\u0438\u043D\u0430: ".concat(rule.minLength, " \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432");
            continue;
        }
        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors[key] = rule.message || 'Неверный формат';
        }
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors,
    };
}
function pick(obj, keys) {
    var result = {};
    keys.forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = obj[key];
        }
    });
    return result;
}
function isEqual(a, b) {
    if (Object.is(a, b))
        return true;
    if (a === null ||
        typeof a !== 'object' ||
        b === null ||
        typeof b !== 'object') {
        return false;
    }
    var objA = a;
    var objB = b;
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length)
        return false;
    for (var _i = 0, keysA_1 = keysA; _i < keysA_1.length; _i++) {
        var key = keysA_1[_i];
        if (!Object.prototype.hasOwnProperty.call(objB, key) ||
            !isEqual(objA[key], objB[key])) {
            return false;
        }
    }
    return true;
}
console.log('=== Тестирование processData ===');
console.log(processData([1, 2, 3]));
console.log(processData({ a: 1, b: 2 }));
console.log(processData('hello'));
console.log('\n=== Тестирование getValue ===');
var testObj = { user: { profile: { name: 'Анна' } } };
console.log(getValue(testObj, 'user.profile.name'));
console.log(getValue(testObj, 'user.nonexistent'));
console.log('\n=== Тестирование EventEmitter ===');
var emitter = new EventEmitter();
emitter.on('test', function (message) { return console.log('Получено:', message); });
emitter.emit('test', 'Привет!');
console.log('\n=== Тестирование pick ===');
var user = {
    name: 'Анна',
    age: 25,
    email: 'anna@example.com',
    password: 'secret',
};
var publicData = pick(user, ['name', 'age', 'email']);
console.log('Публичные данные:', publicData);
