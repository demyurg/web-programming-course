/**
 * Задание 4: Flex и Grid layouts
 *
 * Задачи:
 * 1. Создайте flex контейнер с кнопками (TODO: используйте flex, gap, justify)
 * 2. Создайте grid галерею (TODO: используйте grid, grid-cols, gap)
 * 3. Центрируйте карточку (TODO: используйте flex, items-center, justify-center)
 */

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'] as const;

const colors1: Record<typeof colors[number], string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

const images = [
  'https://www.drivereasy.com/wp-content/uploads/2018/09/Snap48-1.jpg',
  'https://br.atsit.in/ru/wp-content/uploads/2021/06/d0bbd183d187d188d0b8d0b5-d187d0b0d181d18b-samsung-d0b2-2021-d0b3d0bed0b4d183-1.jpg',
  'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_65e31126a8c8392c337c36b2_65e3115e454bf7650ce1dde7/scale_1200',
  'https://yandex-images.clstorage.net/49Yrsl198/2e2410fHIx/8BwU6cVIPTfCbCr460HvSZ2c3rM3i9BBYU6VBxkXBBTB0_2S4ONyf4KfSqPiqohWw1etiokUZ5utJ3cim35sYb5JU7yFAj4zy35j5PkC_0SQ39KlZcXUDjNElVJIfG5guKaTvISfAFOq1x-u5_vESdIXxuaaTHTexC14E5AwLDvyGRDnz2pANdJOZcLBQMd9k_zovTDB9g1gfuQXNHBFb7O1gYqDmCN_kswSs_DR7hXIGNzs7GR_x_wqQiqFKSs5wjUV5-dOSinXWGvWxmTDY6bE6bsu99w9RGLSNx9mfGK4jqCEhp0EUK3CLZHz5MgmyTLK1NJPZMreIFkLmQo1AtAIMuTydVwu109R7PlH73qyw9WiLsH1OFp98hc1bnhHtaKqqbi4E2mC2g6a6fPkN8sqztfIUFLb_xF0Dr8ZOwnTMjT53FxeEvFFRfP_a-hUiMHckir83gljXfkxKG99RYOSiKm1gD18j-wZhMfo1gPpIfvsyGhR3vA1QjaeIDAF7jAo6s5wfzHeXmzgw0XuaaLB2ZcX4NsxRV3-LjlaaEmPsaiGh6MPV777N5LI--oV2ibp8Nd2VtfOBGU0pzErGsMcE_LZSHQO7H1ux-9X32Gh292vAOHoE2F-zCQ4eXRVsou8lpCuH3iO1zyD9NXIAek3yuPzSU358y5yMacmBCb2PC3R2FRpMsNoV-DBeNp5p9HimxPJ4T1_XewzP1pWUr6XjpSfty5btOwQt_Lq8D_sAPzozmJBw_wlWQeuNx4b1A0KwdJVdyLja3TGxEHpY53x-YIU8vQ2TVzNFzVLelCwj6uqoI4je4n5GZTU6MUz6A3z39hmXs_fFl8ZuxsXKsElB_36fGQp0FJOy9lM5F680-SDNM7VEUN98Ro9RUBjnK2Gl4-kHV-j2j2Syc7aDPko6c3Vel7o3DRhNKIVJyjHGRDn-VZgLcdvTPfoftx6jt_Xkxr87zZkT8oINUs',
];

function Task4() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 4: Flex и Grid layouts</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task4.tsx</code> и добавьте flex/grid классы
      </div>

      <div className="space-y-8">
        {/* Flex: горизонтальные кнопки */}
        <div>
          <h3 className="text-lg font-semibold mb-3">1. Flex: кнопки в ряд</h3>
          {/* ✅ Flex + gap */}
          <div className="flex gap-3">
            {colors.map(color => (
              <button
                key={color}
                className={`text-white px-4 py-2 rounded ${colors1[color]}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Grid: галерея изображений */}
        <div>
          <h3 className="text-lg font-semibold mb-3">2. Grid: галерея 2x2</h3>
          {/* ✅ Grid layout */}
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Image ${i + 1}`}
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        </div>

        {/* Flex: центрирование */}
        <div>
          <h3 className="text-lg font-semibold mb-3">3. Flex: центрирование карточки</h3>
          {/* ✅ Центрирование по вертикали и горизонтали */}
          <div className="flex items-center justify-center h-64 bg-gray-200 rounded">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-700">Я по центру!</p>
            </div>
          </div>
        </div>

        {/* Flex: space-between */}
        <div>
          <h3 className="text-lg font-semibold mb-3">4. Flex: space-between</h3>
          <div className="bg-white p-4 rounded shadow">
            {/* ✅ Flex + space-between */}
            <div className="flex justify-between items-center">
              <span className="font-semibold">Товар</span>
              <span className="text-blue-600 font-bold">5990 ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Task4;
