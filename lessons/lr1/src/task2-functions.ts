/*
 * ЗАДАЧА 2: Система управления товарами в интернет-магазине
 * 
 * Инструкции:
 * 1. Создать интерфейсы для всех объектов
 * 2. Добавить правильную типизацию для всех функций
 * 3. Использовать union типы где необходимо
 */

interface Product {
    id: number;
    name: string;
    price: number;
    category: Category;
    inStock: boolean;
    tags: string[];
    createdAt: Date;
}

type Category = "electronics" | "clothing" | "books" | "food" | "other";

interface ProductFilters {
    category?: Category;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
    tag?: string;
}

type DiscountType = 'percentage' | 'fixed' | 'bogo';
type SortBy = 'name' | 'price' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface DiscountResult {
    originalPrice: number;
    finalPrice: number;
    discount: number;
    discountType: DiscountType;
}

// Функция создания товара
function createProduct(
    id: number, 
    name: string, 
    price: number,
    category: Category, 
    inStock: boolean = true, 
    tags: string[] = []
): Product {
    return {
        id,
        name,
        price,
        category,
        inStock,
        tags,
        createdAt: new Date()
    };
}

// Функция фильтрации товаров
function filterProducts(products: Product[], filters: ProductFilters): Product[] {
    return products.filter(product => {
        if (filters.category && product.category !== filters.category) return false;
        if (filters.inStock !== undefined && product.inStock !== filters.inStock) return false;
        if (filters.minPrice && product.price < filters.minPrice) return false;
        if (filters.maxPrice && product.price > filters.maxPrice) return false;
        if (filters.tag && !product.tags.includes(filters.tag)) return false;
        return true;
    });
}

// Функция расчета скидки
function calculateDiscount(product: Product, discountType: DiscountType, value: number): DiscountResult {
    let finalPrice = product.price;
    
    switch (discountType) {
        case 'percentage':
            finalPrice = product.price * (1 - value / 100);
            break;
        case 'fixed':
            finalPrice = Math.max(0, product.price - value);
            break;
        case 'bogo':
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

// Функция сортировки товаров
function sortProducts(products: Product[], sortBy: SortBy, order: SortOrder = 'asc'): Product[] {
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

const discountedPhone = calculateDiscount(products[0]!, 'percentage', 10);
console.log('Скидка на телефон:', discountedPhone);

const sortedByPrice = sortProducts(products, 'price', 'asc');
console.log('Товары по цене (возрастание):', sortedByPrice);