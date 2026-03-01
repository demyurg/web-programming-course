const colors = ["red", "blue", "green", "yellow", "purple", "pink"];
const images = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300",
];

function Task4() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
          Задание 4: Flex и Grid layouts
        </h2>

        <div className="space-y-16">
          {/* 1. Flex: кнопки в ряд */}
          <section className="bg-white rounded-2xl shadow-xl p-10">
            <h3 className="text-2xl font-bold mb-6 text-gray-700">
              1. Flex: кнопки в ряд
            </h3>
            {/* ГОТОВО: flex gap-6 justify-start (или justify-center) */}
            <div className="flex flex-wrap gap-6 justify-center">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`bg-${color}-500 hover:bg-${color}-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200`}
                >
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* 2. Grid: галерея 2x2 */}
          <section className="bg-white rounded-2xl shadow-xl p-10">
            <h3 className="text-2xl font-bold mb-6 text-gray-700">
              2. Grid: галерея 2x2
            </h3>
            {/* ГОТОВО: grid grid-cols-2 gap-8 */}
            <div className="grid grid-cols-2 gap-8">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-500 flex items-center justify-center">
                    <p className="text-white text-2xl font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Изображение {i + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Flex: центрирование карточки */}
          <section className="bg-white rounded-2xl shadow-xl p-10">
            <h3 className="text-2xl font-bold mb-6 text-gray-700">
              3. Flex: центрирование карточки
            </h3>
            {/* ГОТОВО: flex items-center justify-center h-96 bg-gradient-to-br from-indigo-100 to-purple-100 */}
            <div className="flex items-center justify-center h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
              <div className="bg-white p-12 rounded-3xl shadow-2xl text-center transform hover:scale-105 transition-transform duration-300">
                <p className="text-3xl font-bold text-gray-800">
                  Я по центру! 🎯
                </p>
                <p className="text-gray-600 mt-4">
                  Идеально выровнено с помощью Flex
                </p>
              </div>
            </div>
          </section>

          {/* 4. Flex: space-between */}
          <section className="bg-white rounded-2xl shadow-xl p-10">
            <h3 className="text-2xl font-bold mb-6 text-gray-700">
              4. Flex: space-between (пример в карточке товара)
            </h3>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-md"
                >
                  {/* ГОТОВО: flex justify-between items-center */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">
                        Товар {i}
                      </h4>
                      <p className="text-gray-600">
                        Премиум качество • В наличии
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">
                        {(5990 * i).toLocaleString("ru-RU")} ₽
                      </p>
                      <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                        В корзину
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Task4;
