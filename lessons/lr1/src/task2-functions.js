/*
 * ЗАДАЧА 2: Создание типизированных функций и объектов
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Добавьте правильную типизацию для всех функций
 * 3. Создайте интерфейсы для всех объектов
 * 4. Используйте union типы где необходимо
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function createProduct(id, name, price, category, inStock, tags) {
    return {
        id: id,
        name: name,
        price: price,
        category: category,
        inStock: inStock !== null && inStock !== void 0 ? inStock : true,
        tags: tags || [],
        createdAt: new Date(),
    };
}
// TODO: Типизировать функцию фильтрации товаров
function filterProducts(products, filters) {
    return products.filter(function (product) {
        if (filters.category && product.category !== filters.category) {
            return false;
        }
        if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
            return false;
        }
        if (filters.minPrice && product.price < filters.minPrice) {
            return false;
        }
        if (filters.maxPrice && product.price > filters.maxPrice) {
            return false;
        }
        if (filters.tag && !product.tags.includes(filters.tag)) {
            return false;
        }
        return true;
    });
}
function calculateDiscount(product, discountType, value) {
    var finalPrice = product.price;
    switch (discountType) {
        case "percentage":
            finalPrice = product.price * (1 - value / 100);
            break;
        case "fixed":
            finalPrice = Math.max(0, product.price - value);
            break;
        case "buy_one_get_one":
            finalPrice = product.price * 0.5;
            break;
        default:
            break;
    }
    return {
        originalPrice: product.price,
        finalPrice: Math.round(finalPrice * 100) / 100,
        discount: Math.round((product.price - finalPrice) * 100) / 100,
        discountType: discountType,
    };
}
function sortProducts(products, sortBy, order) {
    return __spreadArray([], products, true).sort(function (a, b) {
        var comparison = 0;
        switch (sortBy) {
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "price":
                comparison = a.price - b.price;
                break;
            case "createdAt":
                comparison = a.createdAt.getTime() - b.createdAt.getTime();
                break;
        }
        return order === "desc" ? -comparison : comparison;
    });
}
// Примеры использования
var products = [
    createProduct(1, "iPhone 15", 80000, "electronics", true, [
        "smartphone",
        "apple",
    ]),
    createProduct(2, "Джинсы Levis", 5000, "clothing", false, ["jeans", "denim"]),
    createProduct(3, "JavaScript книга", 1500, "books", true, [
        "programming",
        "js",
    ]),
    createProduct(4, "Хлеб", 50, "food", true, ["bakery", "daily"]),
];
console.log("Все товары:", products);
var electronicsProducts = filterProducts(products, {
    category: "electronics",
    inStock: true,
});
console.log("Электроника в наличии:", electronicsProducts);
var discountedPhone = calculateDiscount(products[0], "percentage", 10);
console.log("Скидка на телефон:", discountedPhone);
var sortedByPrice = sortProducts(products, "price", "asc");
console.log("Товары по цене (возрастание):", sortedByPrice);
