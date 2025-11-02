/**
 * Задание 3: Responsive сетка
 *
 * Задачи:
 * 1. grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
 * 2. Скрыть рейтинг на мобильных: hidden md:flex
 */

const products = [
  { id: 1, name: 'Ноутбук', price: 89990, rating: 4.8, image: 'https://avatars.mds.yandex.net/i?id=b3e0779bafca81c809829419d8d3b1018d791b00-4120598-images-thumbs&n=13' },
  { id: 2, name: 'Смартфон', price: 69990, rating: 4.7, image: 'https://avatars.mds.yandex.net/i?id=39f6eb3e0b22f9800d8664256987f0378866f83c-5398918-images-thumbs&n=13' },
  { id: 3, name: 'Планшет', price: 45990, rating: 4.6, image: 'https://avatars.mds.yandex.net/i?id=24e1d7f496b87e3bf08770a3c1db514c1ed9b08b-11193111-images-thumbs&n=13' },
  { id: 4, name: 'Наушники', price: 25990, rating: 4.9, image: 'https://avatars.mds.yandex.net/i?id=f46eb45032e12bdd949b58aa00574b79cce02b85-6458590-images-thumbs&n=13' },
  { id: 5, name: 'Часы', price: 18990, rating: 4.5, image: 'https://avatars.mds.yandex.net/i?id=1acff73911309a541e6216e18424ff89_l-5331866-images-thumbs&n=13' },
  { id: 6, name: 'Камера', price: 125990, rating: 4.9, image: 'https://avatars.mds.yandex.net/i?id=808e866114247a8b9c01570d8b74b05d76fe1fbd-5509039-images-thumbs&n=13' },
];

function Task3() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 3: Responsive сетка</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task3.tsx</code> и добавьте responsive классы
      </div>

      {/* TODO: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-md p-4">
            <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded" />
            <h3 className="text-lg font-bold mt-3">{p.name}</h3>
            {/* TODO: hidden md:flex */}
            <div className="mt-2 items-center gap-2 hidden md:flex">
              <span>⭐ {p.rating}</span>
            </div>
            <p className="text-xl font-bold text-blue-600 mt-2">{p.price.toLocaleString()} ₽</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-800 text-white rounded">
        <span className="md:hidden">📱 Mobile</span>
        <span className="hidden md:inline lg:hidden">💻 Tablet</span>
        <span className="hidden lg:inline">🖥 Desktop</span>
      </div>
    </div>
  );
}

export default Task3;
