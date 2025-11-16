import { observer } from 'mobx-react-lite'
import { gameStore } from '../stores/gameStore'
import { useUIStore } from '../stores/uiStore'
import Modal from '../components/Modal'

const Task4 = observer(() => {
  const { gameStatus, currentQuestion, selectedAnswer, score, progress } =
    gameStore

  const theme = useUIStore(state => state.theme)
  const soundEnabled = useUIStore(state => state.soundEnabled)
  const toggleTheme = useUIStore(state => state.toggleTheme)
  const openModal = useUIStore(state => state.openModal)
  const setOpenModal = useUIStore(state => state.setOpenModal)
  const closeModal = useUIStore(state => state.closeModal)

  const bgGradient =
    theme === 'light'
      ? 'from-purple-500 to-indigo-600'
      : 'from-gray-900 to-black'

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800'
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white'
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400'
  const primaryColor = theme === 'light' ? 'bg-purple-600' : 'bg-purple-700'
  const primaryHover =
    theme === 'light' ? 'hover:bg-purple-700' : 'hover:bg-purple-800'

  if (gameStatus === 'idle') {
    return (
      <>
        <Modal
          isOpen={openModal !== null}
          onClose={closeModal}
          type={openModal}
        />
        <div
          className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}
        >
          <div
            className={`${cardBg} w-full max-w-md rounded-2xl p-8 shadow-2xl transition-colors duration-300`}
          >
            <div className='mb-4 flex justify-end'>
              <button
                onClick={toggleTheme}
                className={`rounded-lg p-2 ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>

            <h1 className={`mb-2 text-center text-4xl font-bold ${textColor}`}>
              Quiz Game
            </h1>
            <p className={`${mutedText} mb-2 text-center`}>
              MobX + Zustand Edition
            </p>
            <p className={`text-sm ${mutedText} mb-8 text-center`}>
              Звук: {soundEnabled ? '🔊' : '🔇'}
            </p>

            <button
              onClick={() => gameStore.startGame()}
              className={`w-full ${primaryColor} ${primaryHover} transform rounded-xl px-6 py-4 font-semibold text-white transition-all hover:scale-105`}
            >
              Начать игру
            </button>

            <div
              className={`mt-6 rounded-lg p-4 ${theme === 'light' ? 'bg-purple-50' : 'bg-gray-700'}`}
            >
              <p
                className={`text-sm ${theme === 'light' ? 'text-purple-900' : 'text-gray-300'} mb-2`}
              >
                <strong>Task 4:</strong> Комбинация MobX + Zustand
              </p>
              <ul
                className={`text-xs ${theme === 'light' ? 'text-purple-800' : 'text-gray-400'} space-y-1`}
              >
                <li>
                  • <strong>MobX:</strong> Игровая логика (вопросы, счёт)
                </li>
                <li>
                  • <strong>Zustand:</strong> UI настройки (тема, звук)
                </li>
              </ul>
            </div>

            <div className='mt-6 flex gap-2'>
              <button
                onClick={() => setOpenModal('statistics')}
                className={`flex-1 rounded-lg border-2 px-4 py-2 ${theme === 'light' ? 'border-purple-600 text-purple-600 hover:bg-purple-50' : 'border-purple-500 text-purple-400 hover:bg-gray-700'} font-semibold transition-colors`}
              >
                📊 Статистика
              </button>
              <button
                onClick={() => setOpenModal('help')}
                className={`flex-1 rounded-lg border-2 px-4 py-2 ${theme === 'light' ? 'border-purple-600 text-purple-600 hover:bg-purple-50' : 'border-purple-500 text-purple-400 hover:bg-gray-700'} font-semibold transition-colors`}
              >
                ❓ Помощь
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (gameStatus === 'finished') {
    const percentage = Math.round(
      (gameStore.correctAnswersCount / gameStore.questions.length) * 100,
    )
    const totalTime = gameStore.formattedTime
    const getEmoji = () => {
      if (percentage >= 80) return '🏆'
      if (percentage >= 60) return '😊'
      if (percentage >= 40) return '🤔'
      return '😢'
    }

    return (
      <>
        <Modal
          isOpen={openModal !== null}
          onClose={closeModal}
          type={openModal}
        />
        <div
          className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}
        >
          <div
            className={`${cardBg} w-full max-w-md rounded-2xl p-8 text-center shadow-2xl transition-colors duration-300`}
          >
            <div className='mb-4 text-6xl'>{getEmoji()}</div>

            <h2 className={`mb-4 text-3xl font-bold ${textColor}`}>
              Игра завершена!
            </h2>

            <div className='mb-6'>
              <p
                className={`text-5xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'} mb-2`}
              >
                {score}
              </p>
              <p className={mutedText}>очков заработано</p>
            </div>

            <div
              className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} mb-6 rounded-lg p-4`}
            >
              <p className={`text-lg ${textColor}`}>
                Правильных ответов:{' '}
                <span className='font-bold'>
                  {gameStore.correctAnswersCount} из{' '}
                  {gameStore.questions.length}
                </span>
              </p>
              <p
                className={`mt-2 text-2xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}
              >
                {percentage}%
              </p>
            </div>

            <div
              className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} mb-6 rounded-lg p-4`}
            >
              <p className={`text-sm ${mutedText} mb-1`}>Время игры</p>
              <p className={`text-3xl font-bold ${textColor}`}>{totalTime}</p>
              <p className={`text-xs ${mutedText} mt-2`}>
                Среднее время на вопрос: {gameStore.averageTimePerAnswer}с
              </p>
            </div>

            <div className='mb-4 flex gap-2'>
              <button
                onClick={() => setOpenModal('statistics')}
                className={`flex-1 rounded-lg border-2 px-4 py-2 ${theme === 'light' ? 'border-purple-600 text-purple-600 hover:bg-purple-50' : 'border-purple-500 text-purple-400 hover:bg-gray-700'} font-semibold transition-colors`}
              >
                📊 Статистика
              </button>
            </div>

            <button
              onClick={() => gameStore.resetGame()}
              className={`w-full ${primaryColor} ${primaryHover} transform rounded-xl px-6 py-3 font-semibold text-white transition-all hover:scale-105`}
            >
              Играть снова
            </button>
          </div>
        </div>
      </>
    )
  }

  if (!currentQuestion) return null

  return (
    <>
      <Modal
        isOpen={openModal !== null}
        onClose={closeModal}
        type={openModal}
      />
      <div
        className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}
      >
        <div className='mx-auto max-w-2xl'>
          <div
            className={`${cardBg} mb-4 rounded-lg p-4 shadow-md transition-colors duration-300`}
          >
            <div className='mb-2 flex items-center justify-between'>
              <span className={`text-sm ${mutedText}`}>
                Вопрос {gameStore.currentQuestionIndex + 1} из{' '}
                {gameStore.questions.length}
              </span>
              <div className='flex items-center gap-2'>
                <span className={`font-mono text-sm ${mutedText}`}>
                  ⏱️ {gameStore.formattedTime}
                </span>
                <span
                  className={`text-xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}
                >
                  💯 {score}
                </span>
                <button
                  onClick={toggleTheme}
                  className={`rounded p-2 ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <button
                  onClick={() => setOpenModal('settings')}
                  className={`rounded p-2 ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                >
                  ⚙️
                </button>
              </div>
            </div>
            <div
              className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} h-2 rounded-full`}
            >
              <div
                className={`${theme === 'light' ? 'bg-purple-600' : 'bg-purple-500'} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div
            className={`${cardBg} rounded-2xl p-6 shadow-2xl transition-colors duration-300`}
          >
            <div className='mb-4'>
              <span
                className={`rounded-full px-2 py-1 text-xs ${currentQuestion.difficulty === 'easy' && 'bg-green-100 text-green-700'} ${currentQuestion.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700'} ${currentQuestion.difficulty === 'hard' && 'bg-red-100 text-red-700'} `}
              >
                {currentQuestion.difficulty === 'easy' && 'Легкий'}
                {currentQuestion.difficulty === 'medium' && 'Средний'}
                {currentQuestion.difficulty === 'hard' && 'Сложный'}
              </span>
            </div>

            <h2 className={`mb-6 text-2xl font-bold ${textColor}`}>
              {currentQuestion.question}
            </h2>

            <div className='space-y-3'>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentQuestion.correctAnswer
                const showResult = selectedAnswer !== null

                return (
                  <button
                    key={index}
                    onClick={() => gameStore.selectAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${!showResult && theme === 'light' && 'hover:border-purple-400 hover:bg-purple-50'} ${!showResult && theme === 'dark' && 'hover:border-purple-500 hover:bg-gray-700'} ${!showResult && !isSelected && (theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-600 bg-gray-700')} ${!showResult && isSelected && (theme === 'light' ? 'border-purple-500 bg-purple-50' : 'border-purple-500 bg-gray-600')} ${showResult && isCorrect && 'border-green-500 bg-green-50'} ${showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50'} ${showResult && !isCorrect && !isSelected && 'opacity-60'} `}
                  >
                    <div className='flex items-center'>
                      <span
                        className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full font-semibold ${!showResult && (theme === 'light' ? 'bg-gray-200' : 'bg-gray-600 text-white')} ${showResult && isCorrect && 'bg-green-500 text-white'} ${showResult && isSelected && !isCorrect && 'bg-red-500 text-white'} `}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className={`flex-1 ${textColor}`}>{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedAnswer !== null && (
              <button
                onClick={() => gameStore.nextQuestion()}
                className={`mt-6 w-full ${primaryColor} ${primaryHover} rounded-lg px-6 py-3 font-semibold text-white transition-colors`}
              >
                {gameStore.isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
              </button>
            )}
          </div>

          <div
            className={`mt-4 rounded-lg p-4 backdrop-blur-sm ${theme === 'light' ? 'bg-white/20' : 'bg-black/20'}`}
          >
            <p
              className={`text-sm ${theme === 'light' ? 'text-white' : 'text-gray-300'}`}
            >
              <strong>MobX + Zustand:</strong> GameStore управляет игровой
              логикой (observer автообновление), UIStore управляет темой
              (селекторы). Оба работают независимо!
            </p>
          </div>
        </div>
      </div>
    </>
  )
})

export default Task4
