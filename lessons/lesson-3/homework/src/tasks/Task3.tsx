/**
 * Задание 3: Responsive сетка
 *
 * Задачи:
 * 1. grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
 * 2. Скрыть рейтинг на мобильных: hidden md:flex
 */

const products = [
  { id: 1, name: 'Ноутбук', price: 89990, rating: 4.8, image: 'https://ae04.alicdn.com/kf/Sdf9ac711450f4644ba5dc4938644f9b97.jpg' },
  { id: 2, name: 'Смартфон', price: 69990, rating: 4.7, image: 'https://uralcases.ru/wp-content/uploads/2024/09/16-pink_2_11zon.webp' },
  { id: 3, name: 'Планшет', price: 45990, rating: 4.6, image: 'https://www.eldorado.ru/img1/p/b3/73506300.jpg' },
  { id: 4, name: 'Наушники', price: 25990, rating: 4.9, image: 'https://milife-images.storage.yandexcloud.net/iblock/7cb/se918v115catxyre9rrvrmt8liqucxlv/Frame%20279.jpg' },
  { id: 5, name: 'Часы', price: 18990, rating: 4.5, image: 'https://www.ankerwatch.ru/upload/iblock/56c/s3fjt9c1zotsd1k1jeh2f0zdx1cggytx/dd321437_8baa_11ea_aae4_60a44c5c84fd_09ad4433_944e_11ea_aae4_60a44c5c84fd.jpg' },
  { id: 6, name: 'Камера', price: 125990, rating: 4.9, image: 'https://pola-store.ru/1506-8668-thickbox/kodak-m35-pink-new-film-camera.jpg' },
];

function Task3() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 3: Responsive сетка</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task3.tsx</code> и добавьте responsive классы
      </div>

      {/* ✅ Responsive сетка */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-md p-4">
            <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded" />
            <h3 className="text-lg font-bold mt-3">{p.name}</h3>
            
            {/* ✅ Скрыть рейтинг на мобильных */}
            <div className="hidden md:flex mt-2 items-center gap-2">
              <span>⭐ {p.rating}</span>
            </div>

            <p className="text-xl font-bold text-blue-600 mt-2">
              {p.price.toLocaleString()} ₽
            </p>
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
