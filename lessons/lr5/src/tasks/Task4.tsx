import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { StartScreen } from '../components/StartScreen';
import { FinishScreen } from '../components/FinishScreen';
import { GameScreen } from '../components/GameScreen';
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

  // Роутинг по статусу игры
  if (gameStatus === 'idle') {
    return (
      <StartScreen
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
      <FinishScreen
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
    <GameScreen
      theme={theme}
      toggleTheme={toggleTheme}
      score={score}
      progress={progress}
      currentQuestionIndex={gameStore.currentQuestionIndex}
      totalQuestions={gameStore.questions.length}
      currentQuestion={currentQuestion}
      selectedAnswers={selectedAnswers}
      essayAnswer={essayAnswer}
      isLastQuestion={gameStore.isLastQuestion}
      isSubmitting={submitAnswer.isPending || submitSession.isPending}
      onToggleAnswer={(index) => gameStore.toggleAnswer(index)}
      onEssayChange={setEssayAnswer}
      onNextQuestion={handleNextQuestion}
      onFinishGame={handleFinishGame}
    />
  )
})

export default Task4
