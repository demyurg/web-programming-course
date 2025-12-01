interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Наушники",
    price: 5990,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Смарт-часы",
    price: 12990,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Беспроводная мышь",
    price: 3490,
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd4aa2e2564?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Механическая клавиатура",
    price: 8990,
    image:
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
  },
];

function Task1() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Задание 1: Стилизация карточек
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <img
                src={product.image}
                alt={product.name}
                className="rounded w-full h-48 object-cover mb-4"
              />
              <h3 className="text-lg font-bold mt-3 text-gray-800">
                {product.name}
              </h3>
              <p className="text-xl font-bold text-blue-600 mt-2">
                {product.price.toLocaleString("ru-RU")} ₽
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Task1;
