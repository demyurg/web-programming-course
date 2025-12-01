import { observer } from 'mobx-react-lite'
import { gameStore } from '../stores/gameStore'
import { useUIStore } from '../stores/uiStore'
import { ModalType } from '../types/quiz'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  type: ModalType
}

const Modal = observer(({ isOpen, onClose, type }: ModalProps) => {
  const theme = useUIStore(state => state.theme)
  const soundEnabled = useUIStore(state => state.soundEnabled)
  const toggleSound = useUIStore(state => state.toggleSound)

  if (!isOpen || !type) return null

  const bgOverlay = theme === 'light' ? 'bg-black/50' : 'bg-black/70'
  const modalBg = theme === 'light' ? 'bg-white' : 'bg-gray-800'
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white'
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400'
  const borderColor = theme === 'light' ? 'border-gray-200' : 'border-gray-700'
  const accentColor = theme === 'light' ? 'text-purple-600' : 'text-purple-400'

  const renderContent = () => {
    switch (type) {
      case 'statistics':
        return (
          <div className='space-y-4'>
            <h2 className={`text-2xl font-bold ${textColor} mb-4`}>
              📊 Статистика
            </h2>

            <div className={`grid grid-cols-2 gap-4`}>
              <div
                className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}
              >
                <p className={`text-sm ${mutedText}`}>Всего игр</p>
                <p className={`text-3xl font-bold ${accentColor}`}>
                  {gameStore.stats.totalGamesPlayed}
                </p>
              </div>

              <div
                className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}
              >
                <p className={`text-sm ${mutedText}`}>Лучший счёт</p>
                <p className={`text-3xl font-bold ${accentColor}`}>
                  {gameStore.stats.bestScore}
                </p>
              </div>

              <div
                className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}
              >
                <p className={`text-sm ${mutedText}`}>Средний счёт</p>
                <p className={`text-3xl font-bold ${accentColor}`}>
                  {gameStore.stats.averageScore}
                </p>
              </div>

              <div
                className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}
              >
                <p className={`text-sm ${mutedText}`}>Точность</p>
                <p className={`text-3xl font-bold ${accentColor}`}>
                  {gameStore.accuracyPercentage}%
                </p>
              </div>
            </div>

            <div
              className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}
            >
              <div className='mb-2 flex items-center justify-between'>
                <p className={`text-sm ${mutedText}`}>Правильных ответов</p>
                <p className={`font-bold ${textColor}`}>
                  {gameStore.stats.totalCorrectAnswers} /{' '}
                  {gameStore.stats.totalQuestions}
                </p>
              </div>
              <div className='flex items-center justify-between'>
                <p className={`text-sm ${mutedText}`}>Среднее время/вопрос</p>
                <p className={`font-bold ${textColor}`}>
                  {gameStore.stats.averageTimePerQuestion}с
                </p>
              </div>
            </div>

            {gameStore.stats.lastPlayedDate && (
              <p className={`text-xs ${mutedText} text-center`}>
                Последняя игра:{' '}
                {new Date(gameStore.stats.lastPlayedDate).toLocaleString(
                  'ru-RU',
                  {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                )}
              </p>
            )}

            <button
              onClick={() => {
                if (
                  confirm('Вы уверены, что хотите сбросить всю статистику?')
                ) {
                  gameStore.resetStats()
                }
              }}
              className={`mt-4 w-full rounded-lg border-2 border-red-500 px-4 py-2 text-red-500 hover:bg-red-50 ${theme === 'dark' && 'hover:bg-red-900/20'} font-semibold transition-colors`}
            >
              Сбросить статистику
            </button>
          </div>
        )

      case 'settings':
        return (
          <div className='space-y-4'>
            <h2 className={`text-2xl font-bold ${textColor} mb-4`}>
              ⚙️ Настройки
            </h2>

            <div
              className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className={`font-semibold ${textColor}`}>Звук</p>
                  <p className={`text-sm ${mutedText}`}>
                    Звуковые эффекты в игре
                  </p>
                </div>
                <button
                  onClick={toggleSound}
                  className={`h-8 w-14 rounded-full transition-colors ${
                    soundEnabled
                      ? 'bg-purple-600'
                      : theme === 'light'
                        ? 'bg-gray-300'
                        : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                      soundEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div
              className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className={`font-semibold ${textColor}`}>Тема</p>
                  <p className={`text-sm ${mutedText}`}>
                    Текущая тема: {theme === 'light' ? 'Светлая' : 'Тёмная'}
                  </p>
                </div>
                <span className='text-3xl'>
                  {theme === 'light' ? '☀️' : '🌙'}
                </span>
              </div>
            </div>

            <div
              className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-purple-50' : 'bg-gray-700'}`}
            >
              <p
                className={`text-sm ${theme === 'light' ? 'text-purple-900' : 'text-gray-300'}`}
              >
                💡 <strong>Совет:</strong> Используйте кнопку темы в правом
                верхнем углу для быстрого переключения.
              </p>
            </div>
          </div>
        )

      case 'help':
        return (
          <div className='space-y-4'>
            <h2 className={`text-2xl font-bold ${textColor} mb-4`}>
              ❓ Помощь
            </h2>

            <div className='space-y-3'>
              <div
                className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}
              >
                <h3 className={`font-bold ${textColor} mb-2`}>
                  🎮 Как играть?
                </h3>
                <ul className={`text-sm ${mutedText} space-y-1`}>
                  <li>• Отвечайте на вопросы, выбирая правильный вариант</li>
                  <li>• За каждый правильный ответ вы получаете 1 балл</li>
                  <li>• Время на каждый вопрос не ограничено</li>
                  <li>• После ответа вы увидите правильный вариант</li>
                </ul>
              </div>

              <div
                className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}
              >
                <h3 className={`font-bold ${textColor} mb-2`}>
                  🏆 Система оценки
                </h3>
                <ul className={`text-sm ${mutedText} space-y-1`}>
                  <li>• 80%+ правильных ответов: 🏆 Отлично!</li>
                  <li>• 60-79% правильных ответов: 😊 Хорошо!</li>
                  <li>• 40-59% правильных ответов: 🤔 Неплохо</li>
                  <li>• Менее 40%: 😢 Попробуйте ещё раз</li>
                </ul>
              </div>

              <div
                className={`rounded-lg border p-4 ${borderColor} ${theme === 'light' ? 'bg-purple-50' : 'bg-gray-700'}`}
              >
                <h3
                  className={`font-bold ${theme === 'light' ? 'text-purple-900' : 'text-gray-300'} mb-2`}
                >
                  🔧 Технологии
                </h3>
                <p
                  className={`text-sm ${theme === 'light' ? 'text-purple-800' : 'text-gray-400'}`}
                >
                  <strong>MobX:</strong> Управление игровой логикой (вопросы,
                  счёт, таймер, статистика)
                </p>
                <p
                  className={`text-sm ${theme === 'light' ? 'text-purple-800' : 'text-gray-400'} mt-1`}
                >
                  <strong>Zustand:</strong> Управление UI состоянием (тема,
                  звук, модальные окна)
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`fixed inset-0 ${bgOverlay} animate-fade-in z-50 flex items-center justify-center p-4`}
      onClick={onClose}
    >
      <div
        className={`${modalBg} animate-scale-in max-h-[90vh] w-full max-w-lg transform overflow-y-auto rounded-2xl p-6 shadow-2xl transition-all`}
        onClick={e => e.stopPropagation()}
      >
        {renderContent()}

        <button
          onClick={onClose}
          className={`mt-6 w-full rounded-lg px-6 py-3 ${theme === 'light' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-700 hover:bg-purple-800'} font-semibold text-white transition-colors`}
        >
          Закрыть
        </button>
      </div>
    </div>
  )
})

export default Modal