import { observer } from 'mobx-react-lite'
import { gameStore } from '../stores/gameStore'

const Task2 = observer(() => {
  const { gameStatus, currentQuestion, selectedAnswer, score, progress } =
    gameStore

  if (gameStatus === 'idle') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 p-4'>
        <div className='w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl'>
          <h1 className='mb-4 text-4xl font-bold'>Quiz Game</h1>
          <p className='mb-8 text-gray-600'>MobX Edition</p>
          <button
            onClick={() => gameStore.startGame()}
            className='w-full rounded-xl bg-green-600 px-6 py-4 font-semibold text-white transition-all hover:bg-green-700'
          >
            Начать игру
          </button>
          <div className='mt-4 rounded-lg bg-green-50 p-4 text-left'>
            <p className='text-sm text-green-800'>
              <strong>Task 2:</strong> Реализуйте GameStore с использованием
              MobX. Обратите внимание на автоматическую реактивность!
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (gameStatus === 'finished') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 p-4'>
        <div className='w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl'>
          <h2 className='mb-4 text-3xl font-bold'>Игра завершена!</h2>
          <div className='mb-6'>
            <p className='mb-2 text-5xl font-bold text-green-600'>{score}</p>
            <p className='text-gray-600'>
              Правильных ответов: {gameStore.correctAnswersCount} из{' '}
              {gameStore.questions.length}
            </p>
          </div>
          <button
            onClick={() => gameStore.resetGame()}
            className='w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700'
          >
            Начать заново
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-500 to-teal-600 p-4'>
      <div className='mx-auto max-w-2xl'>
        <div className='mb-4 rounded-lg bg-white p-4 shadow-md'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm text-gray-600'>
              Вопрос {gameStore.currentQuestionIndex + 1} из{' '}
              {gameStore.questions.length}
            </span>
            <span className='text-xl font-bold text-green-600'>
              Счёт: {score}
            </span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div
              className='h-2 rounded-full bg-green-600 transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className='rounded-2xl bg-white p-6 shadow-2xl'>
          <div className='mb-4'>
            <span
              className={`rounded-full px-2 py-1 text-xs ${currentQuestion.difficulty === 'easy' && 'bg-green-100 text-green-700'} ${currentQuestion.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700'} ${currentQuestion.difficulty === 'hard' && 'bg-red-100 text-red-700'} `}
            >
              {currentQuestion.difficulty === 'easy' && 'Легкий'}
              {currentQuestion.difficulty === 'medium' && 'Средний'}
              {currentQuestion.difficulty === 'hard' && 'Сложный'}
            </span>
          </div>

          <h2 className='mb-6 text-2xl font-bold text-gray-800'>
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
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${!showResult && 'hover:border-green-400 hover:bg-green-50'} ${!showResult && !isSelected && 'border-gray-200 bg-white'} ${!showResult && isSelected && 'border-green-500 bg-green-50'} ${showResult && isCorrect && 'border-green-500 bg-green-50'} ${showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50'} ${showResult && !isCorrect && !isSelected && 'opacity-60'} `}
                >
                  <div className='flex items-center'>
                    <span
                      className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full font-semibold ${!showResult && 'bg-gray-200'} ${showResult && isCorrect && 'bg-green-500 text-white'} ${showResult && isSelected && !isCorrect && 'bg-red-500 text-white'} `}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className='flex-1'>{option}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedAnswer !== null && (
            <button
              onClick={() => gameStore.nextQuestion()}
              className='mt-6 w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700'
            >
              {gameStore.isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </button>
          )}
        </div>

        <div className='mt-4 rounded-lg bg-white/20 p-4 text-white backdrop-blur-sm'>
          <p className='text-sm'>
            <strong>MobX:</strong> Обратите внимание, что компонент
            автоматически обновляется при изменении observable полей в store. Не
            нужно вручную вызывать setState!
          </p>
        </div>
      </div>
    </div>
  )
})

export default Task2