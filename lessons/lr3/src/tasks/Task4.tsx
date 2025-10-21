const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];
const images = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200',
];

function Task4() {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-500 hover:bg-red-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    yellow: 'bg-yellow-400 hover:bg-yellow-500 text-black',
    purple: 'bg-purple-500 hover:bg-purple-600',
    pink: 'bg-pink-500 hover:bg-pink-600',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 4: Flex и Grid layouts</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task4.tsx</code> и добавьте flex/grid классы
      </div>

      <div className="space-y-8">
        {/* Flex: горизонтальные кнопки */}
        <div>
          <h3 className="text-lg font-semibold mb-3">1. Flex: кнопки в ряд</h3>
          {/* ✅ flex gap-3 justify-center */}
          <div className="flex gap-3 justify-center flex-wrap">
            {colors.map(color => (
              <button
                key={color}
                className={`${colorClasses[color]} text-white px-4 py-2 rounded font-medium transition-colors`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Grid: галерея изображений */}
        <div>
          <h3 className="text-lg font-semibold mb-3">2. Grid: галерея 2x2</h3>
          {/* ✅ grid grid-cols-2 gap-4 */}
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Image ${i + 1}`}
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        </div>

        {/* Flex: центрирование карточки */}
        <div>
          <h3 className="text-lg font-semibold mb-3">3. Flex: центрирование карточки</h3>
          {/* ✅ flex items-center justify-center h-64 bg-gray-200 rounded */}
          <div className="flex items-center justify-center h-64 bg-gray-200 rounded">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-700">ЦЕНТР КАРТОЧКИ</p>
            </div>
          </div>
        </div>

        {/* Flex: space-between */}
        <div>
          <h3 className="text-lg font-semibold mb-3">4. Flex: space-between</h3>
          <div className="bg-white p-4 rounded shadow">
            {/* ✅ flex justify-between items-center */}
            <div className="flex justi  fy-between items-center">
              <span className="font-semibold">ТОВАР</span>
              <span className="text-blue-600 font-bold">5990 ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Task4;
