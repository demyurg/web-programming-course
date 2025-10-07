/*
 * ЗАДАЧА 2: Создание типизированных функций и объектов
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Добавьте правильную типизацию для всех функций
 * 3. Создайте интерфейсы для всех объектов
 * 4. Используйте union типы где необходимо
 */

// Система управления товарами в интернет-магазине

// TODO: Создать интерфейс Product
// Должен содержать: id, name, price, category, inStock, tags[]

// TODO: Создать union тип для категорий
// electronics | clothing | books | food | other

type Category = 'electronics' | 'clothing' | 'books' | 'food' | 'other';

interface Product {
    id: number;
    name: string;
    price: number;
    category: Category;
    inStock: boolean;
    tags: string[];
    createdAt?: any;
}

function createProduct(id: number, name: string, price: number, category: Category, inStock: boolean, tags: string[]) {
    const prod: Product = {
        id,
        name,
        price,
        category,
        inStock: inStock ?? true,
        tags: tags || [],
        createdAt: new Date()
    };
    return prod;
}

type Filters = {
    tag?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: Category;
    inStock?: boolean;
};

// TODO: Типизировать функцию фильтрации товаров
function filterProducts(products: Product[], filters: Filters) {
    return products.filter(product => {
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

type Discount = 'percentage' | 'fixed' | 'buy_one_get_one';

// TODO: Типизировать функцию расчета скидки
function calculateDiscount(product: Product, discountType: Discount, value: number) {
    let finalPrice = product.price;
    switch (discountType) {
        case 'percentage':
            finalPrice = product.price * (1 - value / 100);
            break;
        case 'fixed':
            finalPrice = Math.max(0, product.price - value);
            break;
        case 'buy_one_get_one':
            finalPrice = product.price * 0.5;
            break;
        default:
            break;
    }

    return {
        originalPrice: product.price,
        finalPrice: Math.round(finalPrice * 100) / 100,
        discount: Math.round((product.price - finalPrice) * 100) / 100,
        discountType
    };
}

// TODO: Типизировать функцию сортировки
function sortProducts(products: Product[], sortBy: 'name' | 'price' | 'createdAt', order: 'desc' | 'asc') {
    return [...products].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'price':
                comparison = a.price - b.price;
                break;
            case 'createdAt':
                if (a.createdAt && b.createdAt) {
                    comparison = a.createdAt.getTime() - b.createdAt.getTime();
                }
                break;
        }

        return order === 'desc' ? -comparison : comparison;
    });
}

// Примеры использования
const products = [
    createProduct(1, 'iPhone 15', 80000, 'electronics', true, ['smartphone', 'apple']),
    createProduct(2, 'Джинсы Levis', 5000, 'clothing', false, ['jeans', 'denim']),
    createProduct(3, 'JavaScript книга', 1500, 'books', true, ['programming', 'js']),
    createProduct(4, 'Хлеб', 50, 'food', true, ['bakery', 'daily'])
];

console.log('Все товары:', products);

const electronicsProducts = filterProducts(products, {
    category: 'electronics',
    inStock: true
});
console.log('Электроника в наличии:', electronicsProducts);


let index: number = 0;
// Сделать проверку, есть ли индекс
if (index >= 0 && index < products.length) {
    const product = products[index];
    if (product) {
        const discountedPhone = calculateDiscount(product, 'percentage', 10);
        console.log('Скидка на телефон:', discountedPhone);
    } else {
        console.error('Ошибка: товар по индексу не найден');
    }
}

const sortedByPrice = sortProducts(products, 'price', 'asc');
console.log('Товары по цене (возрастание):', sortedByPrice);
