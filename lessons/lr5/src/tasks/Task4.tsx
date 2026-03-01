import { observer } from "mobx-react-lite";
import { gameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import { useState } from "react";
import {
  usePostApiSessions,
  usePostApiSessionsSessionIdAnswers,
  usePostApiSessionsSessionIdSubmit,
} from "../../generated/api/sessions/sessions";

const Task4 = observer(() => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  // API хуки
  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers();
  const submitSession = usePostApiSessionsSessionIdSubmit();

  const {
    gameStatus,
    currentQuestion,
    selectedAnswers,
    score,
    progress,
    currentQuestionIndex,
    questions,
    correctAnswersCount,
    isLastQuestion,
    isAnswerSelected
  } = gameStore;

  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  // Стили в зависимости от темы
  const bgGradient = theme === "light"
    ? "from-purple-500 to-indigo-600"
    : "from-gray-900 to-black";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-800" : "text-white";
  const mutedText = theme === "light" ? "text-gray-600" : "text-gray-400";
  const primaryColor = theme === "light" ? "bg-purple-600" : "bg-purple-700";
  const primaryHover = theme === "light" ? "hover:bg-purple-700" : "hover:bg-purple-800";

  // Обработчик старта игры
  const handleStartGame = () => {
    createSession.mutate(
      {
        data: {
          questionCount: 10,
        }
      },
      {
        onSuccess: (response) => {
          setSessionId(response.sessionId);
          gameStore.setQuestionsFromAPI(response.questions);
          gameStore.startGame();
        },
        onError: (error) => {
          console.error("Failed to create session:", error);
          gameStore.startGame();
        },
      }
    );
  };

  // Обработчик перехода к следующему вопросу
  const handleNextQuestion = () => {
    if (sessionId && currentQuestion && selectedAnswers.length > 0) {
      gameStore.saveCurrentAnswer();

      submitAnswer.mutate(
        {
          sessionId: sessionId,
          data: {
            questionId: currentQuestion.id,
            selectedOptions: selectedAnswers,
          },
        },
        {
          onSuccess: (response) => {
            if ('pointsEarned' in response) {
              const isCorrect = response.status === "correct" || response.status === "partial";
              gameStore.updateAnswerResult(
                currentQuestion.id,
                isCorrect,
                response.pointsEarned
              );
            }
            gameStore.nextQuestion();
          },
          onError: (error) => {
            console.error("Failed to submit answer:", error);
            gameStore.nextQuestion();
          },
        }
      );
    } else {
      gameStore.saveCurrentAnswer();
      gameStore.nextQuestion();
    }
  };

  // Обработчик завершения игры
  const handleFinishGame = async () => {
    gameStore.forceSaveCurrentAnswer();

    try {
      if (sessionId && currentQuestion && selectedAnswers.length > 0) {
        const answerResponse = await submitAnswer.mutateAsync({
          sessionId: sessionId,
          data: {
            questionId: currentQuestion.id,
            selectedOptions: selectedAnswers,
          },
        });

        if ('pointsEarned' in answerResponse) {
          const isCorrect = answerResponse.status === "correct" || answerResponse.status === "partial";
          gameStore.updateAnswerStatusFromServer(
            currentQuestion.id,
            isCorrect,
            answerResponse.pointsEarned
          );
        }

        const sessionResponse = await submitSession.mutateAsync({ sessionId });

        if (sessionResponse.score && typeof sessionResponse.score === 'object') {
          gameStore.updateScoreFromServer(sessionResponse.score.earned);
        }
      } else if (sessionId) {
        await submitSession.mutateAsync({ sessionId });
      }
    } catch (error) {
      console.error('❌ Error finishing game:', error);
    } finally {
      gameStore.finishGame();
    }
  };

  // Рендеринг вариантов ответов для multiple-select вопросов
  const renderMultipleChoiceOptions = () => {
    if (!currentQuestion?.options || currentQuestion.options.length === 0) {
      return (
        <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-yellow-50' : 'bg-yellow-900'}`}>
          <p className={`text-center ${theme === 'light' ? 'text-yellow-800' : 'text-yellow-200'}`}>
            Нет доступных вариантов ответа
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswers.includes(index);

          return (
            <button
              key={index}
              onClick={() => gameStore.toggleAnswer(index)}
              className={`
                w-full p-4 text-left rounded-lg border-2 transition-all
                ${theme === 'light' ? 'hover:border-purple-400 hover:bg-purple-50' : 'hover:border-purple-500 hover:bg-gray-700'}
                ${!isSelected && (theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-600 bg-gray-700')}
                ${isSelected && (theme === 'light' ? 'border-purple-500 bg-purple-50' : 'border-purple-500 bg-gray-600')}
              `}
            >
              <div className="flex items-center">
                <span className={`
                  w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold
                  ${isSelected ? 'bg-purple-500 text-white' : (theme === 'light' ? 'bg-gray-200' : 'bg-gray-600 text-white')}
                `}>
                  {isSelected ? '✓' : String.fromCharCode(65 + index)}
                </span>
                <span className={`flex-1 ${textColor}`}>{option}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // Рендеринг для essay вопросов
  const renderEssayQuestion = () => {
    return (
      <div className="space-y-4">
        <textarea
          placeholder="Введите ваш развернутый ответ здесь..."
          className={`
            w-full h-40 p-4 rounded-lg border-2 resize-none focus:outline-none
            ${theme === 'light'
              ? 'border-gray-300 bg-white text-gray-800 focus:border-purple-500'
              : 'border-gray-600 bg-gray-700 text-white focus:border-purple-500'
            }
          `}
          rows={6}
        />

        <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          <p>💡 Это вопрос с развернутым ответом. Напишите ваш ответ в поле выше.</p>
        </div>
      </div>
    );
  };

  // Рендеринг для неподдерживаемых типов вопросов
  const renderUnsupportedQuestion = () => {
    return (
      <div className={`
        p-6 rounded-lg border-2 text-center
        ${theme === 'light'
          ? 'bg-orange-50 border-orange-200 text-orange-800'
          : 'bg-orange-900 border-orange-700 text-orange-200'
        }
      `}>
        <p className="font-semibold mb-2">⚠️ Тип вопроса не поддерживается</p>
        <p>Тип: <strong>{currentQuestion?.type}</strong></p>
        <p className="text-sm mt-2">
          Этот формат вопроса пока не доступен в текущей версии приложения
        </p>
      </div>
    );
  };

  // Главный рендерер контента вопроса
  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'multiple-select':
        return renderMultipleChoiceOptions();
      case 'essay':
        return renderEssayQuestion();
      default:
        return renderUnsupportedQuestion();
    }
  };

  // Проверка возможности перехода дальше
  const canProceed = () => {
    if (!currentQuestion) return false;

    switch (currentQuestion.type) {
      case 'multiple-select':
        return isAnswerSelected;
      case 'essay':
        return true; // Для essay всегда можно продолжить
      default:
        return false; // Для неподдерживаемых - нельзя
    }
  };

  // Стартовый экран
  if (gameStatus === "idle") {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300`}>
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <h1 className={`text-4xl font-bold mb-2 text-center ${textColor}`}>
            Quiz Game
          </h1>
          <p className={`${mutedText} mb-2 text-center`}>MobX + Zustand + API Edition</p>
          <p className={`text-sm ${mutedText} mb-8 text-center`}>
            Звук: {soundEnabled ? '🔊' : '🔇'}
          </p>

          <button
            onClick={handleStartGame}
            disabled={createSession.isPending}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 ${createSession.isPending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {createSession.isPending ? 'Создание сессии...' : 'Начать игру'}
          </button>

          <div className={`mt-6 rounded-lg p-4 ${theme === 'light' ? 'bg-purple-50' : 'bg-gray-700'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-purple-900' : 'text-gray-300'} mb-2`}>
              <strong>Task 4:</strong> Комбинация MobX + Zustand + API
            </p>
            <ul className={`text-xs ${theme === 'light' ? 'text-purple-800' : 'text-gray-400'} space-y-1`}>
              <li>• <strong>MobX:</strong> Игровая логика (вопросы, счёт)</li>
              <li>• <strong>Zustand:</strong> UI настройки (тема, звук)</li>
              <li>• <strong>React Query:</strong> Работа с API</li>
              <li>• <strong>Множественный выбор:</strong> Включен ✓</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Экран результатов
  if (gameStatus === "finished") {
    const percentage = questions.length ? Math.round((correctAnswersCount / questions.length) * 100) : 0;
    const getEmoji = () => {
      if (percentage >= 80) return '🏆';
      if (percentage >= 60) return '😊';
      if (percentage >= 40) return '🤔';
      return '😢';
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transition-colors duration-300`}>
          <div className="text-6xl mb-4">{getEmoji()}</div>

          <h2 className={`text-3xl font-bold mb-4 ${textColor}`}>
            Игра завершена!
          </h2>

          <div className="mb-6">
            <p className={`text-5xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'} mb-2`}>
              {score}
            </p>
            <p className={mutedText}>очков заработано</p>
          </div>

          <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg p-4 mb-6`}>
            <p className={`text-lg ${textColor}`}>
              Правильных ответов: <span className="font-bold">{correctAnswersCount} из {questions.length}</span>
            </p>
            <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
              {percentage}%
            </p>
          </div>

          <button
            onClick={() => {
              setSessionId(null);
              gameStore.resetGame();
            }}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
          >
            Играть снова
          </button>
        </div>
      </div>
    );
  }

  // Игровой экран
  if (!currentQuestion) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-2xl p-8 text-center`}>
          <p className={textColor}>Загрузка вопроса...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto">
        {/* Заголовок с прогрессом */}
        <div className={`${cardBg} rounded-lg shadow-md p-4 mb-4 transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm ${mutedText}`}>
              Вопрос {currentQuestionIndex + 1} из {questions.length}
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                Счёт: {score}
              </span>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
          {/* Прогресс бар */}
          <div className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} rounded-full h-2`}>
            <div
              className={`${theme === 'light' ? 'bg-purple-600' : 'bg-purple-500'} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Карточка с вопросом */}
        <div className={`${cardBg} rounded-2xl shadow-2xl p-6 transition-colors duration-300`}>
          {/* Бейджи типа вопроса и сложности */}
          <div className="mb-4 flex gap-2 flex-wrap">
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${currentQuestion.difficulty === 'easy' && 'bg-green-100 text-green-700'}
              ${currentQuestion.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700'}
              ${currentQuestion.difficulty === 'hard' && 'bg-red-100 text-red-700'}
            `}>
              {currentQuestion.difficulty === 'easy' && 'Легкий'}
              {currentQuestion.difficulty === 'medium' && 'Средний'}
              {currentQuestion.difficulty === 'hard' && 'Сложный'}
            </span>

            <span className={`
              text-xs px-2 py-1 rounded-full
              ${currentQuestion.type === 'multiple-select' && 'bg-blue-100 text-blue-700'}
              ${currentQuestion.type === 'essay' && 'bg-purple-100 text-purple-700'}
            `}>
              {currentQuestion.type === 'multiple-select' && 'Множественный выбор'}
              {currentQuestion.type === 'essay' && 'Развернутый ответ'}
              {!['multiple-select', 'essay'].includes(currentQuestion.type) && currentQuestion.type}
            </span>
          </div>

          <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>
            {currentQuestion.question}
          </h2>

          {/* Контент вопроса */}
          {renderQuestionContent()}

          {/* Кнопка "Далее" */}
          {canProceed() && (
            <button
              onClick={isLastQuestion ? handleFinishGame : handleNextQuestion}
              disabled={submitAnswer.isPending || submitSession.isPending}
              className={`mt-6 w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-lg font-semibold transition-colors ${(submitAnswer.isPending || submitSession.isPending) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {(submitAnswer.isPending || submitSession.isPending) ? (
                'Отправка...'
              ) : (
                isLastQuestion ? 'Завершить' : 'Следующий вопрос'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default Task4;