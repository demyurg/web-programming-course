/**
 * Задание 3: Responsive сетка
 *
 * Задачи:
 * 1. grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
 * 2. Скрыть рейтинг на мобильных: hidden md:flex
 */

const products = [
  { id: 1, name: 'Ноутбук', price: 89990, rating: 4.8, image: 'https://avatars.mds.yandex.net/get-mpic/11393590/2a0000018bb0a8ebda5804d90ee856b113da/orig' },
  { id: 2, name: 'Смартфон', price: 69990, rating: 4.7, image: 'https://avatars.mds.yandex.net/i?id=9639784a4ad2131df7d5dcf769373be6_l-9214559-images-thumbs&n=13' },
  { id: 3, name: 'Планшет', price: 45990, rating: 4.6, image: 'https://avatars.mds.yandex.net/get-mpic/4362876/img_id6355371645054447247.jpeg/orig' },
  { id: 4, name: 'Наушники', price: 25990, rating: 4.9, image: 'https://avatars.mds.yandex.net/get-mpic/4599566/img_id1427596587682460144.jpeg/orig' },
  { id: 5, name: 'Часы', price: 18990, rating: 4.5, image: 'https://img.5element.by/import/images/ut/goods/good_28278821-1ca3-11ee-bb94-005056012463/sm-r960nzkacis-smart-chasy-samsung-galaxy-watch-6-classic-47-mm-r960-black-1.jpg' },
  { id: 6, name: 'Камера', price: 125990, rating: 4.9, image: 'https://userscontent2.emaze.com/images/4984b8e1-591c-4dfc-96e5-d4c42321bd05/a6d8bf22-f4c6-4e65-a36e-83eb1cf85beb.png' },
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
            <img src={p.image} alt={p.name} className="w-auto h-40 object-fit rounded" />
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
