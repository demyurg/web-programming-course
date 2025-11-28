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
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqbxTOZWU5IH3pIKcgRacaWY1bosHCvC90Kg&s'
  },
  {
    id: 2,
    name: 'Смарт-часы',
    price: 12990,
    image: 'https://mtscdn.ru/upload/iblock/612/SM_L325_001_Front_Graphite.png'
  },
  {
    id: 3,
    name: 'Наушники',
    price: 5990,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqbxTOZWU5IH3pIKcgRacaWY1bosHCvC90Kg&s'
  },
  {
    id: 4,
    name: 'Смарт-часы',
    price: 12990,
    image: 'https://mtscdn.ru/upload/iblock/612/SM_L325_001_Front_Graphite.png'
  }
  
];

function Task1() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 1: Стилизация карточек</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task1.tsx</code> и добавьте классы
      </div>

      <div className="flex items-center justify-center flex-wrap">
        {products.map(product => (
          <div key={product.id} className="flex items-center justify-center">
            {/* TODO: bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow */}
            <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow w-60 mx-4 my-4">
              {/* TODO: rounded w-full h-40 object-cover */}
              <img src={product.image} alt={product.name} className="rounded h-60
                object-cover" />
              {/* TODO: text-lg font-bold mt-3 */}
              <h3 className="text-lg font-bold mt-3">{product.name}</h3>
              {/* TODO: text-xl font-bold text-blue-600 mt-2 */}
              <p className="text-xl font-bold text-blue-600 mt-2">{product.price.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Task1;
