/**
 * Задание 3: Responsive сетка
 *
 * Задачи:
 * 1. grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
 * 2. Скрыть рейтинг на мобильных: hidden md:flex
 */

const products = [
  { id: 1, name: 'Ноутбук', price: 89990, rating: 4.8, image: 'https://c.dns-shop.ru/thumb/st4/fit/320/250/20ea0dc817a1329db615cb7b2f1be209/f8b5510ad873fa4fb5761f0d4d04aed7e1d5538ed1265c4bb16df0a7a0564b1f.jpg' },
  { id: 2, name: 'Смартфон', price: 69990, rating: 4.7, image: 'https://c.dns-shop.ru/thumb/st1/fit/320/250/7350310e6f1caa3c35bf7d3225c634cf/37495eba72177cebf58365b68df7b997f8c15c97139292fdcc4fb44fa754ad4d.jpg' },
  { id: 3, name: 'Планшет', price: 45990, rating: 4.6, image: 'https://c.dns-shop.ru/thumb/st1/fit/200/200/448f60050d47d16e67049e5c73874773/5204fc401c4c7c57ea0fe64090b608887cf80f33249791b989cdb149b25eb196.jpg.webp' },
  { id: 4, name: 'Наушники', price: 25990, rating: 4.9, image: 'https://c.dns-shop.ru/thumb/st1/fit/320/250/bc102b155dd42d4f1ae08bc7cf3a3bb7/73dd06c0a2d4c9ff74cfaafaedec60012cae0a437e72ed35351e0fa8fa203289.jpg' },
  { id: 5, name: 'Часы', price: 18990, rating: 4.5, image: 'https://c.dns-shop.ru/thumb/st1/fit/500/500/dfdbdec6dd1b833c15535e4ad96213ce/ebd50a3f3dde1d076c173b2c0a4c921295245e505159186ccbd2a5df0fc30362.jpg.webp' },
  { id: 6, name: 'Камера', price: 125990, rating: 4.9, image: 'https://c.dns-shop.ru/thumb/st1/fit/320/250/50df3610672d84904a26fa5e23d158d8/42b08bc250a403778e03943b526e871eaf8896b823ae2e1be0df8d8ea3669029.jpg' },
];

function Task3() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 3: Responsive сетка</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task3.tsx</code> и добавьте responsive классы
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-md p-4">
            <img src={p.image} alt={p.name} className="w-40 h-40 object-cover rounded" />
            <h3 className="text-lg font-bold mt-3">{p.name}</h3>
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
