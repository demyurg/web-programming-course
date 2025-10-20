/**
 * Задание 1: Стилизация карточек
 *
 * Задачи:
 * 1. Карточка: bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow
 * 2. Изображение: rounded w-full h-40 object-cover
 * 3. Название: text-lg font-bold mt-3
 * 4. Цена: text-xl font-bold text-blue-600 mt-2
 */

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Наушники',
    price: 5990,
    image: 'https://c.dns-shop.ru/thumb/st4/fit/wm/0/0/3908093ea7d4c4fbdcd0adcfd5769327/4b1c1955a2530fa2de2ad1f4faa496f553779822690c1505f5400e6c34a1dbe1.jpg.webp'
  },
  {
    id: 2,
    name: 'Смарт-часы',
    price: 12990,
    image: 'https://c.dns-shop.ru/thumb/st1/fit/500/500/dfdbdec6dd1b833c15535e4ad96213ce/ebd50a3f3dde1d076c173b2c0a4c921295245e505159186ccbd2a5df0fc30362.jpg.webp'
  }
];

function Task1() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 1: Стилизация карточек</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task1.tsx</code> и добавьте классы
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map(product => (
          <div key={product.id}>
            <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow">
              <img className="rounded w-full h-40 object-cover" src={product.image} alt={product.name} />
              <h3 className="text-lg font-bold mt-3">{product.name}</h3>
              <p className="text-xl font-bold text-blue-600 mt-2">{product.price.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Task1;
