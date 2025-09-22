type ProductCategory = 'electronics' | 'clothing' | 'books' | 'food' | 'other'

interface Product {
	id: number
	name: string
	price: number
	category: ProductCategory
	inStock: boolean
	tags: string[]
	createdAt: Date
}

interface FilterOptions {
	category?: ProductCategory
	inStock?: boolean
	minPrice?: number
	maxPrice?: number
	tag?: string
}

type DiscountType = 'percentage' | 'fixed' | 'buy_one_get_one'

interface DiscountResult {
	originalPrice: number
	finalPrice: number
	discount: number
	discountType: DiscountType
}

type SortBy = 'name' | 'price' | 'createdAt'
type SortOrder = 'asc' | 'desc'

function createProduct(
	id: number,
	name: string,
	price: number,
	category: ProductCategory,
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
		createdAt: new Date(),
	}
}

function filterProducts(
	products: Product[],
	filters: FilterOptions,
): Product[] {
	return products.filter(product => {
		if (filters.category && product.category !== filters.category) {
			return false
		}
		if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
			return false
		}
		if (filters.minPrice && product.price < filters.minPrice) {
			return false
		}
		if (filters.maxPrice && product.price > filters.maxPrice) {
			return false
		}
		if (filters.tag && !product.tags.includes(filters.tag)) {
			return false
		}
		return true
	})
}

function calculateDiscount(
	product: Product,
	discountType: DiscountType,
	value: number,
): DiscountResult {
	let finalPrice = product.price

	switch (discountType) {
		case 'percentage':
			finalPrice = product.price * (1 - value / 100)
			break
		case 'fixed':
			finalPrice = Math.max(0, product.price - value)
			break
		case 'buy_one_get_one':
			finalPrice = product.price * 0.5
			break
		default:
			break
	}

	return {
		originalPrice: product.price,
		finalPrice: Math.round(finalPrice * 100) / 100,
		discount: Math.round((product.price - finalPrice) * 100) / 100,
		discountType,
	}
}

function sortProducts(
	products: Product[],
	sortBy: SortBy,
	order: SortOrder,
): Product[] {
	return [...products].sort((a, b) => {
		let comparison = 0

		switch (sortBy) {
			case 'name':
				comparison = a.name.localeCompare(b.name)
				break
			case 'price':
				comparison = a.price - b.price
				break
			case 'createdAt':
				comparison = a.createdAt.getTime() - b.createdAt.getTime()
				break
		}

		return order === 'desc' ? -comparison : comparison
	})
}

const products: Product[] = [
	createProduct(1, 'iPhone 15', 80000, 'electronics', true, [
		'smartphone',
		'apple',
	]),
	createProduct(2, 'Джинсы Levis', 5000, 'clothing', false, ['jeans', 'denim']),
	createProduct(3, 'JavaScript книга', 1500, 'books', true, [
		'programming',
		'js',
	]),
	createProduct(4, 'Хлеб', 50, 'food', true, ['bakery', 'daily']),
]

console.log('Все товары:', products)

const electronicsProducts: Product[] = filterProducts(products, {
	category: 'electronics',
	inStock: true,
})
console.log('Электроника в наличии:', electronicsProducts)

const firstProduct = products[0]
if (firstProduct) {
	const discountedPhone: DiscountResult = calculateDiscount(
		firstProduct,
		'percentage',
		10,
	)
	console.log('Скидка на телефон:', discountedPhone)
}

const sortedByPrice: Product[] = sortProducts(products, 'price', 'asc')
console.log('Товары по цене (возрастание):', sortedByPrice)
