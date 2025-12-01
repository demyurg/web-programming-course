const products = [
  {
    id: 1,
    name: "Ноутбук",
    price: 89990,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300",
  },
  {
    id: 2,
    name: "Смартфон",
    price: 69990,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
  },
  {
    id: 3,
    name: "Планшет",
    price: 45990,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300",
  },
  {
    id: 4,
    name: "Наушники",
    price: 25990,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300",
  },
  {
    id: 5,
    name: "Часы",
    price: 18990,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300",
  },
  {
    id: 6,
    name: "Камера",
    price: 125990,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300",
  },
];

function Task3() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Задание 3: Responsive сетка
        </h2>

        {/* ГОТОВО: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {p.name}
                </h3>

                {/* ГОТОВО: hidden md:flex — рейтинг виден только с md и выше */}
                <div className="hidden md:flex items-center gap-2 text-amber-500 mb-3">
                  <span>⭐ {p.rating}</span>
                  <span className="text-sm text-gray-600">(отлично)</span>
                </div>

                <p className="text-2xl font-bold text-blue-600">
                  {p.price.toLocaleString("ru-RU")} ₽
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Индикатор текущего брейкпоинта */}
        <div className="mt-10 p-4 bg-gray-900 text-white rounded-lg text-center font-mono text-lg">
          <span className="md:hidden">📱 Мобильный вид (1 колонка)</span>
          <span className="hidden md:inline lg:hidden">
            💻 Планшет (2 колонки)
          </span>
          <span className="hidden lg:inline">🖥 Десктоп (3 колонки)</span>
        </div>
      </div>
    </div>
  );
}

export default Task3;
