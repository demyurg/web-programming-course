const colors = ["red", "blue", "green", "yellow", "purple", "pink"];
const images = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200",
];

function Task4() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">
        Задание 4: Flex и Grid layouts
      </h2>

      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-3 text-sm">
        Откройте{" "}
        <code className="rounded bg-blue-100 px-1">src/tasks/Task4.tsx</code> и
        добавьте flex/grid классы
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-lg font-semibold">1. Flex: кнопки в ряд</h3>
          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                key={color}
                className="rounded bg-blue-500 px-4 py-2 text-white"
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">2. Grid: галерея 2x2</h3>
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Image ${i + 1}`}
                className="h-32 w-full rounded object-cover"
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">
            3. Flex: центрирование карточки
          </h3>
          <div className="flex h-64 items-center justify-center rounded bg-gray-200">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <p className="text-gray-700">Я по центру!</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">4. Flex: space-between</h3>
          <div className="rounded bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Товар</span>
              <span className="font-bold text-blue-600">5990 ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Task4;
