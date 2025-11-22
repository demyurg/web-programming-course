type Category = "electronics" | "clothing" | "books" | "food" | "other";

interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  inStock: boolean;
  tags: string[];
  createdAt: Date;
}

interface ProductFilters {
  category?: Category;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
}

type DiscountType = "percentage" | "fixed" | "buy_one_get_one";

interface DiscountResult {
  originalPrice: number;
  finalPrice: number;
  discount: number;
  discountType: DiscountType | null;
}

type SortBy = "name" | "price" | "createdAt";
type SortOrder = "asc" | "desc";

function createProduct(
  id: number,
  name: string,
  price: number,
  category: Category,
  inStock?: boolean,
  tags: string[] = []
): Product {
  return {
    id,
    name,
    price,
    category,
    inStock: inStock ?? true,
    tags,
    createdAt: new Date(),
  };
}

// Фильтрация товаров
function filterProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  return products.filter((product) => {
    if (
      filters.category !== undefined &&
      product.category !== filters.category
    ) {
      return false;
    }
    if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
      return false;
    }
    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }
    if (filters.tag !== undefined && !product.tags.includes(filters.tag)) {
      return false;
    }
    return true;
  });
}

function calculateDiscount(
  product: Product,
  discountType: DiscountType,
  value?: number
): DiscountResult {
  let finalPrice = product.price;

  switch (discountType) {
    case "percentage":
      if (value === undefined) {
        throw new Error("Value required for percentage discount");
      }
      finalPrice = product.price * (1 - value / 100);
      break;

    case "fixed":
      if (value === undefined) {
        throw new Error("Value required for fixed discount");
      }
      finalPrice = Math.max(0, product.price - value);
      break;

    case "buy_one_get_one":
      finalPrice = product.price * 0.5;
      break;
  }

  const discountedAmount = product.price - finalPrice;

  return {
    originalPrice: product.price,
    finalPrice: Math.round(finalPrice * 100) / 100,
    discount: Math.round(discountedAmount * 100) / 100,
    discountType,
  };
}

function sortProducts(
  products: Product[],
  sortBy: SortBy,
  order: SortOrder = "asc"
): Product[] {
  return [...products].sort((a, b) => {
    let comparison = 0;

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

// ====================== ПРИМЕРЫ ======================

const products: Product[] = [
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

const electronicsProducts = filterProducts(products, {
  category: "electronics",
  inStock: true,
});
console.log("Электроника в наличии:", electronicsProducts);

// Массив сто проц не пустой
const discountedPhone = calculateDiscount(products[0]!, "percentage", 10);
console.log("Скидка 10% на телефон:", discountedPhone);

const buyOneGetOne = calculateDiscount(products[0]!, "buy_one_get_one");
console.log("Акция 2 по цене 1:", buyOneGetOne);

const sortedByPrice = sortProducts(products, "price", "asc");
console.log("Товары по цене (по возрастанию):", sortedByPrice);

const sortedByNameDesc = sortProducts(products, "name", "desc");
console.log("По названию (по убыванию):", sortedByNameDesc);
