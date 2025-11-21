import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { usePostApiSessions } from '../../generated/api/sessions/sessions';
import { usePostApiSessionsSessionIdAnswers } from '../../generated/api/sessions/sessions';
import { usePostApiSessionsSessionIdSubmit } from '../../generated/api/sessions/sessions';
import { useState } from 'react';

const Task4 = observer(() => {
  const {
    gameStatus, currentQuestion, selectedAnswers, score, progress,
    correctAnswersCount, questions, currentQuestionIndex, isLastQuestion, timeLeft
  } = gameStore;

  const [sessionId, setSessionId] = useState<string | null>(null);

  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers({
    mutation: {
      mutationFn: (variables: any) =>
        fetch(`/api/sessions/${variables.sessionId}/submit`, {  // ← без "s"!
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(variables.data),
        }).then(res => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        }),
    },
  });
  const submitSession = usePostApiSessionsSessionIdSubmit();
  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const toggleSound = useUIStore((state) => state.toggleSound);
  const isModalOpen = useUIStore((state) => state.isModalOpen);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);

  // Цвета в зависимости от темы
  const bgGradient = theme === 'light'
    ? 'from-purple-500 to-indigo-600'
    : 'from-gray-900 to-black';

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const primaryColor = theme === 'light' ? 'bg-purple-600' : 'bg-purple-700';
  const primaryHover = theme === 'light' ? 'hover:bg-purple-700' : 'hover:bg-purple-800';
  const handleStartGame = () => {
    createSession.mutate(
      {
        data: {
          questionCount: 5,
          difficulty: 'medium'
        }
      },
      {
        onSuccess: (response) => {
          setSessionId(response.sessionId);
          gameStore.setQuestionsFromAPI(response.questions);  // ← Загружаем вопросы в gameStore
          gameStore.startGame();  // ← запускаем таймер и статус
        },
        onError: (error) => {
          console.error('Failed to create session:', error);
        },
      }
    );
  };
  const handleNextQuestion = () => {
    if (!currentQuestion || selectedAnswers.length === 0) {
      return; // нет выбранного ответа — выходим
    }

    if (!sessionId) {
      console.error('Нет sessionId, сначала нужно создать сессию');
      return;
    }

    // Сохраняем ответ локально
    gameStore.saveCurrentAnswer();

    // Отправляем на сервер в нужном формате
    const answerData = {
      questionId: String(currentQuestion.id), // обязательно строка
      selectedAnswers: selectedAnswers
    };

    submitAnswer.mutate(
      {
        sessionId,
        data: answerData
      },
      {
        onSuccess: (response) => {
          if ('pointsEarned' in response) {
            const isCorrect = response.status === 'correct';
            gameStore.updateAnswerResult(response.pointsEarned, isCorrect);
          }
          gameStore.nextQuestion();
        },
        onError: (error: any) => {
          console.error('Failed to submit answer:', error);
          gameStore.nextQuestion();
        }
      }
    );
  };


  const handleFinishGame = () => {
    if (sessionId) {
      submitSession.mutate(
        { sessionId },
        {
          onSuccess: (response) => {
            console.log('Session completed:', response);
            gameStore.finishGame();
          },
          onError: (error) => {
            console.error('Failed to submit session:', error);
            gameStore.finishGame();
          },
        }
      );
    } else {
      gameStore.finishGame();
    }
  };

  let mainContent;
  if (gameStatus === 'idle') {
    mainContent = (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300`}>
          <div className="flex justify-end mb-4 gap-4">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'}`}
              title="Toggle sound"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
              title="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <h1 className={`text-4xl font-bold mb-2 text-center ${textColor}`}>
            Quiz Game
          </h1>
          <p className={`${mutedText} mb-2 text-center`}>MobX + Zustand Edition</p>
          <p className={`text-sm ${mutedText} mb-8 text-center`}>
            Звук: {soundEnabled ? '🔊' : '🔇'}
          </p>

          <button
            onClick={openModal}
            className={`w-full mb-4 ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
          >
            Открыть модалку (UIStore)
          </button>

          <button
            onClick={handleStartGame}
            disabled={createSession.isPending}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-60`}
          >
            {createSession.isPending ? 'Загрузка вопросов...' : 'Начать игру'}
          </button>

          {/* Информация о разделении ответственности */}
          <div className={`mt-6 rounded-lg p-4 ${theme === 'light' ? 'bg-purple-50' : 'bg-gray-700'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-purple-900' : 'text-gray-300'} mb-2`}>
              <strong>Task 4:</strong> Комбинация MobX + Zustand
            </p>
            <ul className={`text-xs ${theme === 'light' ? 'text-purple-800' : 'text-gray-400'} space-y-1`}>
              <li>• <strong>MobX:</strong> Игровая логика (вопросы, счёт, таймер)</li>
              <li>• <strong>Zustand:</strong> UI настройки (тема, звук, модалки)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  } else if (gameStatus === 'finished') {
    const percentage = Math.round((correctAnswersCount / questions.length) * 100);

    const getEmoji = () => {
      if (percentage >= 80) return '🏆';
      if (percentage >= 60) return '😊';
      if (percentage >= 40) return '🤔';
      return '😢';
    };

    mainContent = (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transition-colors duration-300`}>
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
              title="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
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
            onClick={() => gameStore.resetGame()}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
          >
            Играть снова
          </button>
        </div>
      </div>
    );
  } else if (!currentQuestion) {
    mainContent = null;
  } else {
    // Игровой экран
    mainContent = (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}>
        <div className="max-w-2xl mx-auto">
          {/* Заголовок с темой */}
          <div className={`${cardBg} rounded-lg shadow-md p-4 mb-4 transition-colors duration-300`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${mutedText}`}>
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </span>
              <div className="flex items-center gap-3">
                {/* Таймер */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${timeLeft > 10 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                  {timeLeft}s
                </div>
                <span className={`text-xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                  Счёт: {score}
                </span>
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                  title="Toggle theme"
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
            <div className="mb-4">
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
            </div>

            <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>
              {currentQuestion.question}
            </h2>

            {/* Варианты ответов */}
            <div className="space-y-3">

              {currentQuestion.options?.map((option, index) => {
                const isSelected = selectedAnswers.includes(index);
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = false;
                const isTimeout = false;

                return (
                  <button
                    key={index}
                    onClick={() => gameStore.toggleAnswer(index)}

                    className={`
                      w-full p-4 text-left rounded-lg border-2 transition-all
                      ${!showResult && theme === 'light' && 'hover:border-purple-400 hover:bg-purple-50'}
                      ${!showResult && theme !== 'light' && 'hover:border-purple-500 hover:bg-gray-700'}
                      ${!showResult && !isSelected && (theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-600 bg-gray-700')}
                      ${!showResult && isSelected && (theme === 'light' ? 'border-purple-500 bg-purple-50' : 'border-purple-500 bg-gray-600')}
                      ${showResult && isCorrect && 'border-green-500 bg-green-50'}
                      ${showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50'}
                      ${showResult && !isCorrect && !isSelected && 'opacity-60'}
                      ${isTimeout && 'border-yellow-500 bg-yellow-50'}
                    `}
                  >
                    <div className="flex items-center">
                      <span className={`
                        w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold
                        ${!showResult && (theme === 'light' ? 'bg-gray-200' : 'bg-gray-600 text-white')}
                        ${showResult && isCorrect && 'bg-green-500 text-white'}
                        ${showResult && isSelected && !isCorrect && 'bg-red-500 text-white'}
                        ${isTimeout && 'bg-yellow-500 text-white'}
                      `}>
                        {isSelected ? '✓' : String.fromCharCode(65 + index)}
                      </span>
                      <span className={`flex-1 ${textColor}`}>
                        {isTimeout && <span className="text-yellow-600 font-bold mr-2">⏰ Время вышло!</span>}
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Кнопка "Далее" */}
            <div style={{ minHeight: '3rem', marginTop: '1rem' }}>
              {selectedAnswers.length > 0 && (
                <button
                  onClick={isLastQuestion ? handleFinishGame : handleNextQuestion}
                  disabled={submitAnswer.isPending || submitSession.isPending}
                  className={`mt-6 w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-60`}
                >
                  {isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
                </button>
              )}
            </div>
          </div>

          {/* Подсказка */}
          <div className={`mt-4 backdrop-blur-sm rounded-lg p-4 ${theme === 'light' ? 'bg-white/20' : 'bg-black/20'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-white' : 'text-gray-300'}`}>
              <strong>MobX + Zustand:</strong> GameStore управляет игровой логикой (observer автообновление),
              UIStore управляет темой (селекторы). Оба работают независимо!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {mainContent}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className={`${cardBg} p-6 rounded-xl shadow-xl max-w-md w-full mx-4`}>
            <h2 className={`text-xl font-bold mb-4 ${textColor}`}>Модальное окно</h2>
            <p className={`${mutedText} mb-4`}>Это модальное окно из Zustand (работает везде!)</p>
            <button
              onClick={closeModal}
              className={`w-full ${primaryColor} ${primaryHover} text-white py-2 rounded-lg`}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default Task4;