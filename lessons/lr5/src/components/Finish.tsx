import { Theme } from '../types/quiz'

interface FinishScreenProps {
  theme: Theme
  score: number
  correctAnswersCount: number
  totalQuestions: number
  onPlayAgain: () => void
}

function Finish({
  theme,
  score,
  correctAnswersCount,
  totalQuestions,
  onPlayAgain,
}: FinishScreenProps) {
  const percentage = Math.round((correctAnswersCount / totalQuestions) * 100)

  const getEmoji = () => {
    if (percentage >= 80) return '🏆'
    if (percentage >= 60) return '😊'
    if (percentage >= 40) return '🤔'
    return '😢'
  }

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

  return (
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
              {correctAnswersCount} из {totalQuestions}
            </span>
          </p>
          <p
            className={`mt-2 text-2xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}
          >
            {percentage}%
          </p>
        </div>

        <button
          onClick={onPlayAgain}
          className={`w-full ${primaryColor} ${primaryHover} transform rounded-xl px-6 py-3 font-semibold text-white transition-all hover:scale-105`}
        >
          Играть снова
        </button>
      </div>
    </div>
  )
}

export { Finish }
