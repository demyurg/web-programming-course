/**
 * Задание 3: Responsive сетка
 *
 * Задачи:
 * 1. grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
 * 2. Скрыть рейтинг на мобильных: hidden md:flex
 */

const products = [
  { id: 1, name: 'Ноутбук', price: 89990, rating: 4.8, image: 'https://s.yimg.com/uu/api/res/1.2/zybv3_wubzJ8t5cYyDjrLw--~B/Zmk9c3RyaW07aD03MjA7dz0xMjgwO2FwcGlkPXl0YWNoeW9u/https://s.yimg.com/os/creatr-uploaded-images/2023-06/daa6b7a0-1747-11ee-bafe-957b370d275b' },
  { id: 2, name: 'Смартфон', price: 69990, rating: 4.7, image: 'https://avatars.mds.yandex.net/i?id=68a17fa29baa6e177004c8d98fbb5907_l-5661150-images-thumbs&n=13' },
  { id: 3, name: 'Планшет', price: 45990, rating: 4.6, image: 'https://avatars.mds.yandex.net/i?id=bc4ad25181dd5daf8e9ac3eb8348dce9aacc1b45-10414886-images-thumbs&n=13' },
  { id: 4, name: 'Наушники', price: 25990, rating: 4.9, image: 'https://avatars.mds.yandex.net/i?id=4cd37f8ae30fe687237fac000a6fc6bb_l-4012804-images-thumbs&n=13' },
  { id: 5, name: 'Часы', price: 18990, rating: 4.5, image: 'https://avatars.mds.yandex.net/get-mpic/7689172/img_id3999768467811250354.png/orig' },
  { id: 6, name: 'Камера', price: 125990, rating: 4.9, image: 'https://avatars.mds.yandex.net/get-mpic/14635071/2a0000019835191d493a7f674e1dd78d7579/orig' },
];

function Task3() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 3: Responsive сетка</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task3.tsx</code> и добавьте responsive классы
      </div>

      {/* Сетка с адаптацией */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-md p-4">
            <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded" />
            <h3 className="text-lg font-bold mt-3">{p.name}</h3>

            {/*Скрываем рейтинг на мобильных */}
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
