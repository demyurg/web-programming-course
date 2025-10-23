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
];

function Task1() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">
        Задание 1: Стилизация карточек
      </h2>

      <div className="mb-4 border-l-4 border-blue-500 bg-blue-50 p-3 text-sm">
        Откройте{" "}
        <code className="rounded bg-blue-100 px-1">src/tasks/Task1.tsx</code> и
        добавьте классы
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {products.map((product) => (
          <div key={product.id}>
            <div className="rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-xl">
              <img
                src={product.image}
                alt={product.name}
                className="h-40 w-full rounded object-cover"
              />
              <h3 className="mt-3 text-lg font-bold">{product.name}</h3>
              <p className="mt-2 text-xl font-bold text-blue-600">
                {product.price.toLocaleString("ru-RU")} ₽
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Task1;
