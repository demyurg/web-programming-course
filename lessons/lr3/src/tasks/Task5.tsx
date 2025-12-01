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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
          Задание 5: Responsive дизайн
        </h2>

        <div className="space-y-16">
          {/* 1. Responsive grid */}
          <section className="bg-white rounded-2xl shadow-2xl p-10">
            <h3 className="text-2xl font-bold mb-8 text-gray-700 text-center">
              1. Responsive grid (1 → 2 → 3 колонки)
            </h3>
            {/* ГОТОВО: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {p.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">{p.desc}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {p.price.toLocaleString("ru-RU")} ₽
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Скрыть на мобильных */}
          <section className="bg-white rounded-2xl shadow-2xl p-10">
            <h3 className="text-2xl font-bold mb-8 text-gray-700 text-center">
              2. Скрыть на мобильных (только на md+)
            </h3>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8 text-center">
              <p className="font-bold text-xl text-gray-800">
                Основной текст (всегда виден)
              </p>
              {/* ГОТОВО: hidden md:block */}
              <p className="hidden md:block text-gray-700 mt-4 text-lg">
                ✨ Дополнительная информация — видна только на планшетах и
                десктопах!
              </p>
            </div>
          </section>

          {/* 3. Responsive текст */}
          <section className="bg-white rounded-2xl shadow-2xl p-10">
            <h3 className="text-2xl font-bold mb-8 text-gray-700 text-center">
              3. Responsive размер текста
            </h3>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl p-12 text-center">
              {/* ГОТОВО: text-sm md:text-base lg:text-lg xl:text-xl */}
              <p className="text-sm md:text-base lg:text-lg xl:text-xl font-medium text-gray-800 leading-relaxed">
                Этот текст меняет размер в зависимости от экрана:
                <br />
                <strong>Маленький</strong> на мобильных →{" "}
                <strong>Средний</strong> на планшетах → <strong>Большой</strong>{" "}
                на десктопах!
              </p>
            </div>
          </section>

          {/* 4. Responsive кнопка */}
          <section className="bg-white rounded-2xl shadow-2xl p-10">
            <h3 className="text-2xl font-bold mb-8 text-gray-700 text-center">
              4. Кнопка: полная ширина → обычная
            </h3>
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-10 text-center">
              {/* ГОТОВО: w-full lg:w-auto */}
              <button className="w-full lg:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                Купить сейчас
              </button>
              <p className="mt-6 text-gray-700">
                На мобильных — на всю ширину, на десктопе — обычная
              </p>
            </div>
          </section>

          {/* Индикатор breakpoint */}
          <div className="mt-12 p-6 bg-gray-900 text-white rounded-2xl text-center font-bold text-xl shadow-2xl">
            <span className="md:hidden">📱 Mobile (&lt;768px)</span>
            <span className="hidden md:inline lg:hidden">
              💻 Tablet (768–1023px)
            </span>
            <span className="hidden lg:inline">🖥 Desktop (≥1024px)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Task5;
