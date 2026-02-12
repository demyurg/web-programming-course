import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {gameStore} from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { QuizButton } from '../components/quiz/QuizButton';
import { MultipleSelectQuestion } from '../components/quiz/MultipleSelectQuestion';
import { EssayQuestion } from '../components/quiz/EssayQuestion';
import { StartPos } from '../components/StartPos';
import { Finish } from '../components/Finish';
import { usePostApiSessions, usePostApiSessionsSessionIdAnswers, usePostApiSessionsSessionIdSubmit } from '../../generated/api/sessions/sessions';
import type { Question } from '../types/quiz'

const Task4 = observer(() => {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [essayAnswer, setEssayAnswer] = useState<string>('')

  const createSession = usePostApiSessions()
  const submitAnswer = usePostApiSessionsSessionIdAnswers()
  const submitSession = usePostApiSessionsSessionIdSubmit()

  const { gameStatus, currentQuestion, selectedAnswers, score, progress } =
    gameStore

  const theme = useUIStore(state => state.theme)
  const soundEnabled = useUIStore(state => state.soundEnabled)
  const toggleTheme = useUIStore(state => state.toggleTheme)

  const bgGradient =
    theme === 'light'
      ? 'from-purple-500 to-indigo-600'
      : 'from-gray-900 to-black'

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800'
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white'
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400'

  const handleStartGame = () => {
    createSession.mutate(
      {
        data: {},
      },
      {
        onSuccess: response => {
          setSessionId(response.sessionId)
          const questions: Question[] = response.questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options || [],
            correctAnswer: 0,
            difficulty: q.difficulty,
          }))
          gameStore.setQuestionsFromAPI(questions)
          gameStore.gameStatus = 'playing'
        },
        onError: error => {
          console.error('Failed to create session:', error)
        },
      },
    )
  }

  const handleNextQuestion = () => {
    if (sessionId && currentQuestion) {
      const hasAnswer =
        selectedAnswers.length > 0 || essayAnswer.trim().length > 0

      if (!hasAnswer) return

      gameStore.saveCurrentAnswer()

      const submissionData: any = {
        questionId: String(currentQuestion.id),
      }

      if (currentQuestion.options && currentQuestion.options.length > 0) {
        submissionData.selectedOptions = selectedAnswers
      } else {
        submissionData.text = essayAnswer
      }

      submitAnswer.mutate(
        {
          sessionId,
          data: submissionData,
        },
        {
          onSuccess: response => {
            if ('pointsEarned' in response) {
              const isCorrect = response.status === 'correct'
              gameStore.updateAnswerResult(
                currentQuestion.id,
                isCorrect,
                response.pointsEarned,
              )
            }
            gameStore.nextQuestion()
            setEssayAnswer('')
          },
          onError: error => {
            console.error('Failed to submit answer:', error)
            gameStore.nextQuestion()
            setEssayAnswer('')
          },
        },
      )
    }
  }

  const handleFinishGame = () => {
    if (sessionId && currentQuestion) {
      const hasAnswer =
        selectedAnswers.length > 0 || essayAnswer.trim().length > 0

      if (!hasAnswer) return

      gameStore.saveCurrentAnswer()

      const submissionData: any = {
        questionId: String(currentQuestion.id),
      }

      if (currentQuestion.options && currentQuestion.options.length > 0) {
        submissionData.selectedOptions = selectedAnswers
      } else {
        submissionData.text = essayAnswer
      }

      submitAnswer.mutate(
        {
          sessionId,
          data: submissionData,
        },
        {
          onSuccess: response => {
            if ('pointsEarned' in response) {
              const isCorrect = response.status === 'correct'
              gameStore.updateAnswerResult(
                currentQuestion.id,
                isCorrect,
                response.pointsEarned,
              )
            }

            submitSession.mutate(
              { sessionId },
              {
                onSuccess: response => {
                  console.log('Session completed:', response)
                  gameStore.finishGame()
                },
                onError: error => {
                  console.error('Failed to submit session:', error)
                  gameStore.finishGame()
                },
              },
            )
          },
          onError: error => {
            console.error('Failed to submit answer:', error)
            submitSession.mutate(
              { sessionId },
              {
                onSuccess: () => gameStore.finishGame(),
                onError: () => gameStore.finishGame(),
              },
            )
          },
        },
      )
    } else if (sessionId) {
      submitSession.mutate(
        { sessionId },
        {
          onSuccess: response => {
            console.log('Session completed:', response)
            gameStore.finishGame()
          },
          onError: error => {
            console.error('Failed to submit session:', error)
            gameStore.finishGame()
          },
        },
      )
    } else {
      gameStore.finishGame()
    }
  }

  if (gameStatus === 'idle') {
    return (
      <StartPos
        theme={theme}
        soundEnabled={soundEnabled}
        toggleTheme={toggleTheme}
        handleStartGame={handleStartGame}
        isPending={createSession.isPending}
      />
    )
  }

  if (gameStatus === 'finished') {
    return (
      <Finish
        theme={theme}
        score={score}
        correctAnswersCount={gameStore.correctAnswersCount}
        totalQuestions={gameStore.questions.length}
        onPlayAgain={() => gameStore.resetGame()}
      />
    )
  }

  if (!currentQuestion) return null

  return (
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
            <div className='flex items-center gap-3'>
              <span
                className={`text-xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}
              >
                Счёт: {score}
              </span>
              <button
                onClick={toggleTheme}
                className={`rounded p-2 ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
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

          {currentQuestion.options && currentQuestion.options.length > 0 ? (
            <MultipleSelectQuestion
              question={currentQuestion}
              selectedAnswers={selectedAnswers}
              onToggleAnswer={(index) => gameStore.toggleAnswer(index)}
            />
          ) : (
            <EssayQuestion
              question={currentQuestion}
              textAnswer={essayAnswer}
              onTextChange={setEssayAnswer}
            />
          )}

          {(selectedAnswers.length > 0 || essayAnswer.trim().length > 0) && (
            <div className="mt-6">
              <QuizButton
                onClick={
                  gameStore.isLastQuestion ? handleFinishGame : handleNextQuestion
                }
                disabled={submitAnswer.isPending || submitSession.isPending}
                variant="primary"
              >
                {submitAnswer.isPending || submitSession.isPending
                  ? 'Отправка...'
                  : gameStore.isLastQuestion
                    ? 'Завершить'
                    : 'Следующий вопрос'}
              </QuizButton>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default Task4