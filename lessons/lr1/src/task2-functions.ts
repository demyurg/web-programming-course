// Система управления товарами в интернет-магазине

// Интерфейс Product
interface Product {
    id: number;
    name: string;
    price: number;
    category: CategoryType;
    inStock: boolean;
    tags: string[];
    createdAt: Date;
}

// Union тип для категорий
type CategoryType = 'electronics' | 'clothing' | 'books' | 'food' | 'other';

// Функция создания продукта
function createProduct(
    id: number,
    name: string,
    price: number,
    category: CategoryType,
    inStock?: boolean,
    tags?: string[],
): Product {
    return {
        id,
        name,
        price,
        category,
        inStock: inStock ?? true,
        tags: tags || [],
        createdAt: new Date()
    };
}

// Интерфейс фильтра
interface Filters {
    category?: CategoryType;
    minPrice?: number;
    maxPrice?: number;
    tag?: string;
    inStock?: boolean;
}

// Функция фильтрации товаров
function filterProducts(products: Product[], filters: Filters): Product[] {
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

// Определение типа скидки
type DiscountType = 'percentage' | 'fixed' | 'buy_one_get_one';

// Результат подсчета скидки
interface DiscountResult {
    originalPrice: number;
    finalPrice: number;
    discount: number;
    discountType: DiscountType;
}

// Расчет скидки
function calculateDiscount(product: Product, discountType: DiscountType, value: number): DiscountResult {
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
    }

    return {
        originalPrice: product.price,
        finalPrice: Math.round(finalPrice * 100) / 100,
        discount: Math.round((product.price - finalPrice) * 100) / 100,
        discountType
    };
}

// Порядок сортировки
type SortOrder = 'asc' | 'desc';

// Функция сортировки товаров
function sortProducts(products: Product[], sortBy: 'name' | 'price' | 'createdAt', order: SortOrder): Product[] {
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
                comparison = a.createdAt.getTime() - b.createdAt.getTime();
                break;
        }

        return order === 'desc' ? -comparison : comparison;
    });
}

// Примеры использования
const products: Product[] = [
    createProduct(1, 'iPhone 15', 80000, 'electronics', true, ['smartphone', 'apple']),
    createProduct(2, 'Джинсы Levis', 5000, 'clothing', false, ['jeans', 'denim']),
    createProduct(3, 'JavaScript книга', 1500, 'books', true, ['programming', 'js']),
    createProduct(4, 'Хлеб', 50, 'food', true, ['bakery', 'daily'])
];

console.log('Все товары:', products);

// Фильтруем электронику в наличии
const electronicsInStock = filterProducts(products, { category: 'electronics', inStock: true });
console.log('Электронные товары в наличии:', electronicsInStock);

// Рассчитываем скидку на первый товар (iPhone)
const iPhoneDiscount = calculateDiscount(products[0], 'percentage', 10);
console.log('Скидка на iPhone:', iPhoneDiscount);

// Сортируем товары по возрастанию цены
const sortedByPriceAsc = sortProducts(products, 'price', 'asc');
console.log('Отсортированные товары по цене (возрастание):', sortedByPriceAsc);