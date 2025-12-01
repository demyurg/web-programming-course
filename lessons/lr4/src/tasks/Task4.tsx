import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';

const Task4 = observer(() => {
  // MobX - бизнес-логика
  const { 
    gameStatus, 
    currentQuestion,
    selectedAnswer, 
    score, 
    progress,
    currentQuestionIndex,
    questions,
    correctAnswersCount,
    isLastQuestion,
    timer,
    gameStats
  } = gameStore;

  // Zustand - UI состояние
  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const notificationsEnabled = useUIStore((state) => state.notificationsEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const setTheme = useUIStore((state) => state.setTheme);

  // Цвета в зависимости от темы
  const bgGradient = theme === 'light'
    ? 'from-purple-500 to-indigo-600'
    : 'from-gray-900 to-black';

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const primaryColor = theme === 'light' ? 'bg-purple-600' : 'bg-purple-700';
  const primaryHover = theme === 'light' ? 'hover:bg-purple-700' : 'hover:bg-purple-800';

  // Стартовый экран
  if (gameStatus === 'idle') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300`}>
          {/* Переключатель темы */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
              title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <h1 className={`text-4xl font-bold mb-2 text-center ${textColor}`}>
            Quiz Game
          </h1>
          <p className={`${mutedText} mb-2 text-center`}>MobX + Zustand Edition</p>
          <div className={`flex justify-center gap-4 mb-6`}>
            <span className={`text-sm ${mutedText}`}>Звук: {soundEnabled ? '🔊' : '🔇'}</span>
            <span className={`text-sm ${mutedText}`}>Уведомления: {notificationsEnabled ? '🔔' : '🔕'}</span>
          </div>

          <button
            onClick={() => gameStore.startGame()}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
          >
            Начать игру
          </button>

          {/* Информация о разделении ответственности */}
          <div className={`mt-6 rounded-lg p-4 ${theme === 'light' ? 'bg-purple-50' : 'bg-gray-700'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-purple-900' : 'text-gray-300'} mb-2`}>
              <strong>Task 4:</strong> Комбинация MobX + Zustand
            </p>
            <ul className={`text-xs ${theme === 'light' ? 'text-purple-800' : 'text-gray-400'} space-y-1`}>
              <li>• <strong>MobX:</strong> Игровая логика (вопросы, счёт, таймер, статистика)</li>
              <li>• <strong>Zustand:</strong> UI настройки (тема, звук, уведомления)</li>
              <li>• <strong>Разделение:</strong> UI не зависит от бизнес-логики</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Экран результатов
  if (gameStatus === 'finished') {
    const percentage = Math.round((correctAnswersCount / questions.length) * 100);
    const getEmoji = () => {
      if (percentage >= 80) return '🏆';
      if (percentage >= 60) return '😊';
      if (percentage >= 40) return '🤔';
      return '😢';
    };

    const getRating = () => {
      if (percentage >= 90) return 'Отлично!';
      if (percentage >= 70) return 'Хорошо!';
      if (percentage >= 50) return 'Неплохо!';
      return 'Попробуйте еще раз!';
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transition-colors duration-300`}>
          <div className="text-6xl mb-4">{getEmoji()}</div>

          <h2 className={`text-3xl font-bold mb-2 ${textColor}`}>
            {getRating()}
          </h2>
          <p className={`${mutedText} mb-6`}>Игра завершена!</p>

          <div className="mb-6">
            <p className={`text-5xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'} mb-2`}>
              {score}
            </p>
            <p className={mutedText}>очков заработано</p>
          </div>

          <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg p-4 mb-6`}>
            <div className="space-y-3">
              <p className={`text-lg ${textColor}`}>
                Правильных ответов: <span className="font-bold">{correctAnswersCount} из {questions.length}</span>
              </p>
              <p className={`text-2xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                {percentage}%
              </p>
              <div className={`grid grid-cols-2 gap-2 text-sm ${mutedText}`}>
                <div>Время игры:</div>
                <div className="font-semibold">{gameStats.totalTimeSpent} сек.</div>
                <div>Среднее время:</div>
                <div className="font-semibold">{gameStats.averageTimePerQuestion} сек./вопрос</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => gameStore.resetGame()}
              className={`flex-1 ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
            >
              Главное меню
            </button>
            <button
              onClick={() => gameStore.startGame()}
              className={`flex-1 ${theme === 'light' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-700 hover:bg-green-600'} text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
            >
              Играть снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Игровой экран
  if (!currentQuestion) return null;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto">
        {/* Заголовок с темой */}
        <div className={`${cardBg} rounded-lg shadow-md p-4 mb-4 transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <span className={`text-sm ${mutedText}`}>
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </span>
              <div className={`text-xs px-2 py-1 rounded ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-600'}`}>
                ⏱️ {timer} сек.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                Счёт: {score}
              </span>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                title={theme === 'light' ? 'Темная тема' : 'Светлая тема'}
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
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = selectedAnswer !== null;

              return (
                <button
                  key={index}
                  onClick={() => gameStore.selectAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`
                    w-full p-4 text-left rounded-lg border-2 transition-all
                    ${!showResult && theme === 'light' && 'hover:border-purple-400 hover:bg-purple-50'}
                    ${!showResult && theme === 'dark' && 'hover:border-purple-500 hover:bg-gray-700'}
                    ${!showResult && !isSelected && (theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-600 bg-gray-700')}
                    ${!showResult && isSelected && (theme === 'light' ? 'border-purple-500 bg-purple-50' : 'border-purple-500 bg-gray-600')}
                    ${showResult && isCorrect && 'border-green-500 bg-green-50'}
                    ${showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50'}
                    ${showResult && !isCorrect && !isSelected && 'opacity-60'}
                  `}
                >
                  <div className="flex items-center">
                    <span className={`
                      w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold
                      ${!showResult && (theme === 'light' ? 'bg-gray-200' : 'bg-gray-600 text-white')}
                      ${showResult && isCorrect && 'bg-green-500 text-white'}
                      ${showResult && isSelected && !isCorrect && 'bg-red-500 text-white'}
                    `}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={`flex-1 ${textColor}`}>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Кнопка "Далее" */}
          {selectedAnswer !== null && (
            <button
              onClick={() => gameStore.nextQuestion()}
              className={`mt-6 w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-lg font-semibold transition-colors transform hover:scale-105`}
            >
              {isLastQuestion ? 'Завершить игру' : 'Следующий вопрос'}
            </button>
          )}
        </div>

        {/* Подсказка */}
        <div className={`mt-4 backdrop-blur-sm rounded-lg p-4 ${theme === 'light' ? 'bg-white/20' : 'bg-black/20'}`}>
          <p className={`text-sm ${theme === 'light' ? 'text-white' : 'text-gray-300'} mb-2`}>
            <strong>MobX + Zustand:</strong> GameStore управляет игровой логикой (observer автообновление),
            UIStore управляет темой (селекторы). Оба работают независимо!
          </p>
          <div className={`text-xs ${theme === 'light' ? 'text-white/80' : 'text-gray-400'} grid grid-cols-2 gap-1`}>
            <div>✓ MobX: вопросы, счёт, таймер</div>
            <div>✓ Zustand: тема, звук, настройки</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Task4;