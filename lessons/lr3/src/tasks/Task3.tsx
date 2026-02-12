/**
 * Задание 3: Responsive сетка
 *
 * Задачи:
 * 1. grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
 * 2. Скрыть рейтинг на мобильных: hidden md:flex
 */

const products = [
  { id: 1, name: 'Ноутбук', price: 89990, rating: 4.8, image: 'https://cdn.citilink.ru/Dtz87w0tMtYRa86G0KFe9I368vvJHmniTkUm-RwJ-H0/resizing_type:fit/gravity:sm/width:220/height:220/plain/product-images/73de64c7-5bc9-496a-b0a1-4a238104c6d4.jpg' },
  { id: 2, name: 'Смартфон', price: 69990, rating: 4.7, image: 'https://www.mijia-shop.com/wp-content/uploads/2025/09/Xiaomi-17-Pro-Max-5.jpg' },
  { id: 3, name: 'Планшет', price: 45990, rating: 4.6, image: 'https://lunafon.ru/image/cache/catalog/Tabs/samsung/samsunga82021gray-1000x1000.jpg' },
  { id: 4, name: 'Наушники', price: 25990, rating: 4.9, image: 'https://audio-technica-shop.ru/image/cache/catalog/0708/naushniki-sony-wh-ch500-hc-100023475454-1000x1000.jpg' },
  { id: 5, name: 'Часы', price: 18990, rating: 4.5, image: 'https://formulatv.ru/images/catalog/smart-chasi/galaxy-watch-4-classic-46mm-silver-sm-r890_full.jpg' },
  { id: 6, name: 'Камера', price: 125990, rating: 4.9, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIZo869_T0KXxJCbDrYXFOq26iwtZBHkm-fg&s' },
];

function Task3() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 3: Responsive сетка</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task3.tsx</code> и добавьте responsive классы
      </div>

      {/* grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-md p-4">
            <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded" />
            <h3 className="text-lg font-bold mt-3">{p.name}</h3>

            {/* hidden md:flex */}
            <div className="hidden md:flex mt-2 items-center gap-2">
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
