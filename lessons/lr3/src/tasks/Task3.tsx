/**
 * Задание 3: Responsive сетка
 *
 * Задачи:
 * 1. grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
 * 2. Скрыть рейтинг на мобильных: hidden md:flex
 */

const products = [
  { id: 1, name: 'Ноутбук', price: 89990, rating: 4.8, image: 'https://www.mk.ru/upload/entities/2018/08/26/articles/detailPicture/a4/da/79/3d/76ea9b2126cace773d30fa065f93e399.jpg' },
  { id: 2, name: 'Смартфон', price: 69990, rating: 4.7, image: 'https://avatars.mds.yandex.net/i?id=cbefe397874380aaefdaf2e3876013f2_l-6637734-images-thumbs&n=13' },
  { id: 3, name: 'Планшет', price: 45990, rating: 4.6, image: 'https://avatars.mds.yandex.net/i?id=b850c8c6f0f029f25fa12afb1520b2f6_l-4077540-images-thumbs&n=13' },
  { id: 4, name: 'Наушники', price: 25990, rating: 4.9, image: 'https://avatars.mds.yandex.net/i?id=796509ce36415236b2b7e0509cc1d7dd448f8202-4340501-images-thumbs&n=13' },
  { id: 5, name: 'Часы', price: 18990, rating: 4.5, image: 'https://d2cdo4blch85n8.cloudfront.net/wp-content/uploads/2020/07/Spiritus-Aroma-Diffuser-Alarm-Clock-image-3.jpg' },
  { id: 6, name: 'Камера', price: 125990, rating: 4.9, image: 'https://i.pinimg.com/736x/3b/b4/c1/3bb4c158b6f8dee0d704e8172fecc668.jpg' },
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
            <img src={p.image} alt={p.name} className="w-full h-auto object-cover rounded" />
            <h3 className="text-lg font-bold mt-3">{p.name}</h3>
            {/* TODO: hidden md:flex */}
            <div className="hidden md:flex ">
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
