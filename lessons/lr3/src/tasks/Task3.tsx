const products = [
  {
    id: 1,
    name: 'Ноутбук',
    price: 89990,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300',
  },
  {
    id: 2,
    name: 'Смартфон',
    price: 69990,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
  },
  {
    id: 3,
    name: 'Планшет',
    price: 45990,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300',
  },
  {
    id: 4,
    name: 'Наушники',
    price: 25990,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300',
  },
  {
    id: 5,
    name: 'Часы',
    price: 18990,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300',
  },
  {
    id: 6,
    name: 'Камера',
    price: 125990,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
  },
]

function Task3() {
  return (
    <div>
      <h2 className='mb-4 text-2xl font-bold'>Задание 3: Responsive сетка</h2>

      <div className='mb-4 border-l-4 border-blue-500 bg-blue-50 p-3 text-sm'>
        Откройте{' '}
        <code className='rounded bg-blue-100 px-1'>src/tasks/Task3.tsx</code> и
        добавьте responsive классы
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {products.map(p => (
          <div key={p.id} className='rounded-lg bg-white p-4 shadow-md'>
            <img
              src={p.image}
              alt={p.name}
              className='h-40 w-full rounded object-cover'
            />
            <h3 className='mt-3 text-lg font-bold'>{p.name}</h3>
            <div className='mt-2 hidden items-center gap-2 md:flex'>
              <span>⭐ {p.rating}</span>
            </div>
            <p className='mt-2 text-xl font-bold text-blue-600'>
              {p.price.toLocaleString()} ₽
            </p>
          </div>
        ))}
      </div>

      <div className='mt-6 rounded bg-gray-800 p-3 text-white'>
        <span className='md:hidden'>📱 Mobile</span>
        <span className='hidden md:inline lg:hidden'>💻 Tablet</span>
        <span className='hidden lg:inline'>🖥 Desktop</span>
      </div>
    </div>
  )
}

export default Task3
