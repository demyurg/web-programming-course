const products = [
  { id: 1, name: "Товар 1", price: 1990, desc: "Описание товара" },
  { id: 2, name: "Товар 2", price: 2990, desc: "Описание товара" },
  { id: 3, name: "Товар 3", price: 3990, desc: "Описание товара" },
  { id: 4, name: "Товар 4", price: 4990, desc: "Описание товара" },
  { id: 5, name: "Товар 5", price: 5990, desc: "Описание товара" },
  { id: 6, name: "Товар 6", price: 6990, desc: "Описание товара" },
];

function Task5() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Задание 5: Responsive дизайн</h2>

      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-3 text-sm">
        Откройте{" "}
        <code className="rounded bg-blue-100 px-1">src/tasks/Task5.tsx</code> и
        добавьте responsive классы. Измените размер окна!
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            1. Responsive grid (1→2→3 колонки)
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className="rounded bg-white p-4 shadow">
                <h4 className="font-bold">{p.name}</h4>
                <p className="text-sm text-gray-600">{p.desc}</p>
                <p className="mt-2 font-bold text-blue-600">{p.price} ₽</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">
            2. Скрыть на мобильных, показать на планшетах+
          </h3>
          <div className="rounded bg-white p-4 shadow">
            <p className="font-semibold">Основной текст (всегда виден)</p>
            <p className="mt-2 hidden text-gray-600 md:block">
              Дополнительная информация (только на планшетах и десктопах)
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">
            3. Responsive размер текста
          </h3>
          <div className="rounded bg-white p-4 shadow">
            <p className="text-sm md:text-base lg:text-lg">
              Этот текст меняет размер: маленький на мобильных, средний на
              планшетах, большой на десктопах
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">
            4. Кнопка: полная ширина → обычная
          </h3>
          <div className="rounded bg-white p-4 shadow">
            <button className="w-full rounded bg-blue-500 px-6 py-2 text-white lg:w-auto">
              Купить
            </button>
          </div>
        </div>

        <div className="mt-6 rounded bg-gray-800 p-3 text-center font-semibold text-white">
          <span className="md:hidden">📱 Mobile (&lt;768px)</span>
          <span className="hidden md:inline lg:hidden">
            💻 Tablet (768px-1023px)
          </span>
          <span className="hidden lg:inline">🖥 Desktop (≥1024px)</span>
        </div>
      </div>
    </div>
  );
}

export default Task5;
