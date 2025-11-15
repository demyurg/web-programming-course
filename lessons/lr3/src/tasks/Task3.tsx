/**
 * Задание 3: Responsive сетка
 *
 * Задачи:
 * 1. grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
 * 2. Скрыть рейтинг на мобильных: hidden md:flex
 */

import React from 'react'

interface Product {
	id: number
	name: string
	price: number
	rating: number
	image: string
}

const products = [
	{
		id: 1,
		name: 'Ноутбук',
		price: 89990,
		rating: 4.8,
		image:
			'https://avatars.mds.yandex.net/i?id=3d3392dda131aa4494dfa182fb6b8320035f5940-16451641-images-thumbs&n=13',
	},
	{
		id: 2,
		name: 'Смартфон',
		price: 69990,
		rating: 4.7,
		image:
			'https://avatars.mds.yandex.net/get-marketpic/5393326/picd31d299e388524809da079bee5663b15/orig',
	},
	{
		id: 3,
		name: 'Планшет',
		price: 45990,
		rating: 4.6,
		image:
			'https://avatars.mds.yandex.net/get-mpic/4362876/img_id6355371645054447247.jpeg/orig',
	},
	{
		id: 4,
		name: 'Наушники',
		price: 25990,
		rating: 4.9,
		image:
			'https://avatars.mds.yandex.net/get-mpic/4599566/img_id1427596587682460144.jpeg/orig',
	},
	{
		id: 5,
		name: 'Часы',
		price: 18990,
		rating: 4.5,
		image:
			'https://avatars.mds.yandex.net/get-mpic/15049969/2a0000019679caa00f93b4dba33b1d3a111d/orig',
	},
	{
		id: 6,
		name: 'Камера',
		price: 125990,
		rating: 4.9,
		image:
			'https://avatars.mds.yandex.net/i?id=651d2922919ad95795007a32cab8b576_l-5121678-images-thumbs&n=13',
	},
]

function Task3() {
	return (
		<div>
			<h2 className='text-2xl font-bold mb-4'>Задание 3: Responsive сетка</h2>

			<div className='bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm'>
				Откройте{' '}
				<code className='bg-blue-100 px-1 rounded'>src/tasks/Task3.tsx</code> и
				добавьте responsive классы
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{products.map(p => (
					<div key={p.id} className='bg-white rounded-lg shadow-md p-4'>
						<img
							src={p.image}
							alt={p.name}
							className='w-full h-40 object-cover rounded'
						/>
						<h3 className='text-lg font-bold mt-3'>{p.name}</h3>
						<div className='hidden md:flex'></div>
						<div className='mt-2 items-center gap-2'>
							<span>⭐ {p.rating}</span>
						</div>
						<p className='text-xl font-bold text-blue-600 mt-2'>
							{p.price.toLocaleString('ru-RU')} ₽
						</p>
					</div>
				))}
			</div>

			<div className='mt-6 p-3 bg-gray-800 text-white rounded'>
				<span className='md:hidden'>📱 Mobile</span>
				<span className='hidden md:inline lg:hidden'>💻 Tablet</span>
				<span className='hidden lg:inline'>🖥 Desktop</span>
			</div>
		</div>
	)
}

export default Task3
