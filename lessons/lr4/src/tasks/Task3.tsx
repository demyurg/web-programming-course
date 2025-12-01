import { useUIStore } from '../stores/uiStore';

const Task3 = () => {
  // Используем селекторы
  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const notificationsEnabled = useUIStore((state) => state.notificationsEnabled);
  const fontSize = useUIStore((state) => state.fontSize);
  
  // Используем actions
  const { 
    toggleTheme, 
    toggleSound, 
    toggleNotifications,
    setTheme,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize 
  } = useUIStore();

  // Стили в зависимости от темы
  const bgGradient = theme === 'light'
    ? 'from-orange-400 to-pink-500'
    : 'from-gray-800 to-gray-900';

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-300';

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}
      style={{ fontSize: `${fontSize}px` }} // применяем размер шрифта
    >
      <div className="max-w-2xl mx-auto">
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 transition-colors duration-300`}>
          {/* ... предыдущий код ... */}

          {/* Новый блок: Настройка размера шрифта */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
              Размер шрифта: {fontSize}px
            </label>
            <div className="flex gap-2">
              <button
                onClick={decreaseFontSize}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                disabled={fontSize <= 12}
              >
                А-
              </button>
              <button
                onClick={resetFontSize}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Сброс
              </button>
              <button
                onClick={increaseFontSize}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                disabled={fontSize >= 24}
              >
                А+
              </button>
            </div>
          </div>

          {/* Информация (добавляем fontSize) */}
          <div className={`border-t pt-6 ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>
              Текущее состояние
            </h3>
            <div className="space-y-2">
              <div className={`flex justify-between ${mutedText}`}>
                <span>Тема:</span>
                <span className="font-semibold">{theme === 'light' ? 'Светлая' : 'Тёмная'}</span>
              </div>
              <div className={`flex justify-between ${mutedText}`}>
                <span>Звук:</span>
                <span className="font-semibold">{soundEnabled ? 'Включен' : 'Выключен'}</span>
              </div>
              <div className={`flex justify-between ${mutedText}`}>
                <span>Уведомления:</span>
                <span className="font-semibold">
                  {notificationsEnabled ? 'Включены' : 'Выключены'}
                </span>
              </div>
              <div className={`flex justify-between ${mutedText}`}>
                <span>Размер шрифта:</span>
                <span className="font-semibold">{fontSize}px</span>
              </div>
              <div className={`flex justify-between ${mutedText}`}>
                <span>Сохранение:</span>
                <span className="font-semibold">localStorage ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task3;