import { useUIStore } from '../stores/uiStore'

const Task3 = () => {
  const theme = useUIStore(state => state.theme)
  const soundEnabled = useUIStore(state => state.soundEnabled)
  const toggleTheme = useUIStore(state => state.toggleTheme)
  const toggleSound = useUIStore(state => state.toggleSound)

  const bgGradient =
    theme === 'light'
      ? 'from-orange-400 to-pink-500'
      : 'from-gray-800 to-gray-900'

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800'
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white'
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-300'

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}
    >
      <div className='mx-auto max-w-2xl'>
        <div
          className={`${cardBg} rounded-2xl p-8 shadow-2xl transition-colors duration-300`}
        >
          <h1 className={`mb-2 text-3xl font-bold ${textColor}`}>
            Настройки приложения
          </h1>
          <p className={`${mutedText} mb-8`}>Zustand Edition</p>

          <div className='mb-6'>
            <label className={`mb-3 block text-sm font-semibold ${textColor}`}>
              Тема оформления
            </label>
            <div className='flex gap-4'>
              <button
                onClick={() => useUIStore.getState().setTheme('light')}
                className={`flex-1 rounded-lg px-4 py-3 font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } `}
              >
                ☀️ Светлая
              </button>
              <button
                onClick={() => useUIStore.getState().setTheme('dark')}
                className={`flex-1 rounded-lg px-4 py-3 font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } `}
              >
                🌙 Тёмная
              </button>
            </div>
          </div>

          <div className='mb-6'>
            <label className={`mb-3 block text-sm font-semibold ${textColor}`}>
              Звуковые эффекты
            </label>
            <button
              onClick={toggleSound}
              className={`w-full rounded-lg px-6 py-4 font-semibold transition-all ${
                soundEnabled
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
              } `}
            >
              {soundEnabled ? '🔊 Звук включен' : '🔇 Звук выключен'}
            </button>
          </div>

          <div className='mb-8'>
            <label className={`mb-3 block text-sm font-semibold ${textColor}`}>
              Быстрое переключение
            </label>
            <button
              onClick={toggleTheme}
              className={`w-full rounded-lg px-6 py-4 font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                  : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white'
              } transform hover:scale-105 hover:shadow-lg`}
            >
              {theme === 'light'
                ? '🌙 Переключить на тёмную'
                : '☀️ Переключить на светлую'}
            </button>
          </div>

          <div
            className={`border-t pt-6 ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}
          >
            <h3 className={`mb-3 text-lg font-semibold ${textColor}`}>
              Текущее состояние
            </h3>
            <div className='space-y-2'>
              <div className={`flex justify-between ${mutedText}`}>
                <span>Тема:</span>
                <span className='font-semibold'>
                  {theme === 'light' ? 'Светлая' : 'Тёмная'}
                </span>
              </div>
              <div className={`flex justify-between ${mutedText}`}>
                <span>Звук:</span>
                <span className='font-semibold'>
                  {soundEnabled ? 'Включен' : 'Выключен'}
                </span>
              </div>
              <div className={`flex justify-between ${mutedText}`}>
                <span>Сохранение:</span>
                <span className='font-semibold'>localStorage ✓</span>
              </div>
            </div>
          </div>

          <div
            className={`mt-6 rounded-lg p-4 ${theme === 'light' ? 'bg-orange-50' : 'bg-gray-700'}`}
          >
            <p
              className={`text-sm ${theme === 'light' ? 'text-orange-800' : 'text-gray-300'}`}
            >
              <strong>Task 3:</strong> Реализуйте UIStore с использованием
              Zustand. Обратите внимание на persist middleware - настройки
              сохраняются автоматически! Попробуйте перезагрузить страницу.
            </p>
          </div>

          <div
            className={`mt-4 rounded-lg p-4 ${theme === 'light' ? 'bg-blue-50' : 'bg-gray-700'}`}
          >
            <p
              className={`text-sm ${theme === 'light' ? 'text-blue-800' : 'text-gray-300'}`}
            >
              <strong>Селекторы:</strong> Каждая часть UI подписана только на
              нужную часть store. Изменение темы не вызовет ре-рендер
              компонента, который использует только soundEnabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Task3
