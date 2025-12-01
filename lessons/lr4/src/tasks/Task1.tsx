import { useState } from 'react'
import { mockQuestions } from '../data/questions'
import { Question } from '../types/quiz'

const Task1 = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState<number>(0)
  const [isFinished, setIsFinished] = useState<boolean>(false)

  const currentQuestion: Question = mockQuestions[currentQuestionIndex]

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answerIndex)

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex === mockQuestions.length - 1) {
      setIsFinished(true)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setIsFinished(false)
  }

  if (isFinished) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4'>
        <div className='w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl'>
          <h2 className='mb-4 text-3xl font-bold'>Игра завершена!</h2>
          <div className='mb-6'>
            <p className='mb-2 text-5xl font-bold text-blue-600'>{score}</p>
            <p className='text-gray-600'>
              из {mockQuestions.length} правильных
            </p>
          </div>
          <button
            onClick={handleRestart}
            className='w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700'
          >
            Начать заново
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4'>
      <div className='mx-auto max-w-2xl'>
        <div className='mb-4 rounded-lg bg-white p-4 shadow-md'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm text-gray-600'>
              Вопрос {currentQuestionIndex + 1} из {mockQuestions.length}
            </span>
            <span className='text-xl font-bold text-blue-600'>
              Счёт: {score}
            </span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div
              className='h-2 rounded-full bg-blue-600 transition-all duration-300'
              style={{
                width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className='rounded-2xl bg-white p-6 shadow-2xl'>
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
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${!showResult && 'hover:border-blue-400 hover:bg-blue-50'} ${!showResult && !isSelected && 'border-gray-200 bg-white'} ${!showResult && isSelected && 'border-blue-500 bg-blue-50'} ${showResult && isCorrect && 'border-green-500 bg-green-50'} ${showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50'} ${showResult && !isCorrect && !isSelected && 'opacity-60'} `}
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
              onClick={handleNextQuestion}
              className='mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700'
            >
              {currentQuestionIndex === mockQuestions.length - 1
                ? 'Завершить'
                : 'Следующий вопрос'}
            </button>
          )}
        </div>

        <div className='mt-4 rounded-lg bg-white/20 p-4 text-white backdrop-blur-sm'>
          <p className='text-sm'>
            <strong>Task 1:</strong> Управление состоянием с помощью useState.
            Реализуйте недостающую логику в обработчиках событий.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Task1