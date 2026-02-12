import { observer } from 'mobx-react-lite';

import gameStore from '../stores/gameStore';

import { useState } from 'react';

import { QuizButton } from '../components/quiz/QuizButton';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { MultipleSelectQuestion } from '../components/quiz/MultipleSelectQuestion';
import { EssayQuestion } from '../components/quiz/EssayQuestion';
import { usePostApiSessions, usePostApiSessionsSessionIdAnswers, usePostApiSessionsSessionIdSubmit } from '../../generated/api/sessions/sessions';

const Task4 = observer(() => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [serverFinalResult, setServerFinalResult] = useState<any | null>(null);
  const currentQuestion = gameStore.currentQuestion;

  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers();
  const submitSession = usePostApiSessionsSessionIdSubmit();

  const handleStartGame = () => {
    createSession.mutate(
      { data: { questionCount: 5, difficulty: "medium" } },
      {
        onSuccess: (data) => {
          setSessionId(data.sessionId);
          setServerFinalResult(null);
          gameStore.setQuestionsFromAPI(data.questions);
          gameStore.startGame();
        }
      }
    );
  };

  const finishSessionOnServer = () => {
    if (!sessionId) {
      gameStore.finishGame();
      return;
    }

    submitSession.mutate(
      { sessionId },
      {
        onSuccess: (resp) => {
          console.log("SESSION_FINAL:", resp);
          setServerFinalResult(resp);
          gameStore.finishGame();
        },
        onError: () => gameStore.finishGame()
      }
    );
  };

  const handleNextQuestion = () => {
    if (!sessionId || !currentQuestion) return;

    if (currentQuestion.type === "essay" && gameStore.textAnswer.trim().length === 0) return;
    if (currentQuestion.type !== "essay" && gameStore.selectedAnswers.length === 0) return;

    const payload: any = {
      questionId: currentQuestion.id.toString(),
    };
    
    if (currentQuestion.type === "essay") {
      payload.text = gameStore.textAnswer;
    } else {
      payload.selectedOptions = gameStore.selectedAnswers;
    }

    submitAnswer.mutate(
      { sessionId, data: payload },
      {
        onSuccess: (resp) => {
          console.log("ANSWER_RESPONSE:", resp);

          let isCorrect = false;
          let points = 0;

          if ('status' in resp && resp.status !== 'pending') {
            isCorrect = resp.status === "correct";
            points = resp.pointsEarned ?? 0;
          }

          gameStore.saveCurrentAnswer();
          gameStore.updateAnswerResult(isCorrect, points);

          const wasLast = gameStore.isLastQuestion;

          gameStore.nextQuestion();

          if (wasLast) finishSessionOnServer();
        },
        onError: () => {
          const wasLast = gameStore.isLastQuestion;

          gameStore.saveCurrentAnswer();
          gameStore.updateAnswerResult(false, 0);

          gameStore.nextQuestion();

          if (wasLast) finishSessionOnServer();
        }
      }
    );
  };

  const canProceed = currentQuestion?.type === 'multiple-select'
    ? gameStore.selectedAnswers.length > 0
    : gameStore.textAnswer.trim().length >= (currentQuestion?.minLength || 0);

  if (!gameStore.isPlaying && gameStore.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <QuizButton onClick={handleStartGame}>
          Начать игру
        </QuizButton>
      </div>
    );
  }

  if (!gameStore.isPlaying && gameStore.questions.length > 0) {
    const earned = serverFinalResult?.score?.earned ?? 0;
    const percentage = serverFinalResult?.score?.percentage ?? 0;

    const getEmoji = () => {
      if (percentage >= 80) return '🏆';
      if (percentage >= 60) return '😊';
      if (percentage >= 40) return '🤔';
      return '😢';
    };

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">{getEmoji()}</div>
          <h2 className="text-3xl font-bold mb-4">Игра завершена!</h2>
          <p className="text-5xl font-bold mb-2">{earned}</p>
          <p className="text-gray-600 mb-4">({percentage}%)</p>
          <QuizButton
            onClick={() => {
              gameStore.resetGame();
              setServerFinalResult(null);
            }}
          >
            Играть снова
          </QuizButton>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <QuizProgress
        current={gameStore.currentQuestionIndex}
        total={gameStore.questions.length}
      />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>

        <div className="flex gap-4 mb-6 text-sm">
          <span className="px-3 py-1 bg-gray-100 rounded">
            Тип: {currentQuestion.type}
          </span>
          <span className="px-3 py-1 bg-yellow-100 rounded">
            Сложность: {currentQuestion.difficulty}
          </span>
          <span className="px-3 py-1 bg-green-100 rounded">
            Баллов: {currentQuestion.maxPoints}
          </span>
        </div>

        {currentQuestion.type === 'multiple-select' && (
          <MultipleSelectQuestion
            question={currentQuestion}
            selectedAnswers={gameStore.selectedAnswers}
            onToggleAnswer={(index) => gameStore.toggleAnswer(index)}
          />
        )}

        {currentQuestion.type === 'essay' && (
          <EssayQuestion
            question={currentQuestion}
            textAnswer={gameStore.textAnswer}
            onTextChange={(text) => gameStore.setTextAnswer(text)}
          />
        )}

        {canProceed && (
          <div className="mt-6">
            <QuizButton
            
              onClick={gameStore.isLastQuestion ? finishSessionOnServer : handleNextQuestion}
              disabled={submitAnswer.isPending || submitSession.isPending}
            >
              {gameStore.isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </QuizButton>
          </div>
        )}
      </div>
    </div>
  );
});

export default Task4;
