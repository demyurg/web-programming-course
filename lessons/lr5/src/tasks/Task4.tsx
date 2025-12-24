import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';

const Task4 = observer(() => {
  const {
    gameStatus,
    currentQuestion,
    selectedAnswers,
    essayAnswer,            
    score,
    progress,
    correctAnswersCount,
    questions,
    currentQuestionIndex,
    isLastQuestion,
    timeLeft,
  } = gameStore;

  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const toggleSound = useUIStore((state) => state.toggleSound);
  const isModalOpen = useUIStore((state) => state.isModalOpen);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);

  const primaryColor = theme === 'light' ? 'bg-purple-600' : 'bg-purple-700';
  const primaryHover = theme === 'light' ? 'hover:bg-purple-700' : 'hover:bg-purple-800';
  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const bgGradient = theme === 'light' ? 'from-purple-500 to-indigo-600' : 'from-gray-900 to-black';

  const handleStartGame = async () => {
    await gameStore.createSession(5, 'medium');
    gameStore.startGame();
  };

  const handleNextQuestion = async () => {
    await gameStore.nextQuestion();
  };

  const handleFinishGame = async () => {
    await gameStore.nextQuestion(); 
  };

  // ===== UI логика =====
  let mainContent;

  if (gameStatus === 'idle') {
    mainContent = (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full`}>
          <div className="flex justify-end mb-4 gap-4">
            <button onClick={toggleSound} className="p-2 rounded-lg" title="Toggle sound">
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg" title="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <h1 className={`text-4xl font-bold mb-2 text-center ${textColor}`}>Quiz Game</h1>
          <p className={`${mutedText} mb-8 text-center`}>MobX + Zustand Edition</p>

          <button
            onClick={openModal}
            className={`w-full mb-4 ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-xl`}
          >
            Открыть модалку
          </button>

          <button
            onClick={handleStartGame}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-4 px-6 rounded-xl`}
          >
            Начать игру
          </button>
        </div>
      </div>
    );
  } else if (gameStatus === 'finished') {
    const percentage = Math.round((correctAnswersCount / questions.length) * 100);
    const getEmoji = () => (percentage >= 80 ? '🏆' : percentage >= 60 ? '😊' : percentage >= 40 ? '🤔' : '😢');

    mainContent = (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center`}>
          <div className="flex justify-end mb-4">
            <button onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
          </div>
          <div className="text-6xl mb-4">{getEmoji()}</div>
          <h2 className={`text-3xl font-bold mb-4 ${textColor}`}>Игра завершена!</h2>
          <p className={`text-5xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'} mb-2`}>
            {score}
          </p>
          <p className={mutedText}>очков заработано</p>

          <p className={`text-lg ${textColor}`}>
            Правильных ответов: <strong>{correctAnswersCount} из {questions.length}</strong>
          </p>
          <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
            {percentage}%
          </p>

          <button onClick={() => gameStore.resetGame()} className={`w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-xl mt-4`}>
            Играть снова
          </button>
        </div>
      </div>
    );
  } else if (!currentQuestion) {
    mainContent = null;
  } else {
    // Проверяем, можно ли показать кнопку "Следующий / Завершить"
    const canSubmit =
      currentQuestion.type === 'multiple-select'
        ? selectedAnswers.length > 0
        : essayAnswer.trim().length > 0;

    mainContent = (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4`}>
        <div className="max-w-2xl mx-auto">
          <div className={`${cardBg} rounded-lg shadow-md p-4 mb-4`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${mutedText}`}>Вопрос {currentQuestionIndex + 1} из {questions.length}</span>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${timeLeft > 10 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {timeLeft}s
                </div>
                <span className={`text-xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                  Счёт: {score}
                </span>
              </div>
            </div>
            <div className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} rounded-full h-2`}>
              <div className={`${theme === 'light' ? 'bg-purple-600' : 'bg-purple-500'} h-2 rounded-full transition-all`} style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-2xl p-6`}>
            <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>{currentQuestion.question}</h2>

            <div className="space-y-3">
              {/* Multiple-select */}
              {currentQuestion.type === 'multiple-select' && currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers.includes(index);
                return (
                  <button
                    key={index}
                    onClick={() => gameStore.toggleAnswer(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${!isSelected ? 'border-gray-300' : 'border-purple-500 bg-purple-50'}`}
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold">{isSelected ? '✓' : String.fromCharCode(65 + index)}</span>
                      <span className={textColor}>{option}</span>
                    </div>
                  </button>
                );
              })}

              {/* Essay */}
              {currentQuestion.type === 'essay' && (
                <textarea
                  value={essayAnswer}                           
                  onChange={(e) => gameStore.setEssayAnswer(e.target.value)}
                  placeholder="Введите свой ответ..."
                  className={`w-full p-4 border-2 rounded-lg ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'} ${textColor}`}
                  rows={6}
                />
              )}
            </div>

            <div style={{ minHeight: '3rem', marginTop: '1rem' }}>
              {canSubmit && (
                <button
                  onClick={gameStore.isLastQuestion ? handleFinishGame : handleNextQuestion}
                  className={`mt-6 w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-lg`}
                  disabled={
                    currentQuestion.type === 'multiple-select'
                      ? selectedAnswers.length === 0
                      : !essayAnswer.trim()
                  }
                >
                  {gameStore.isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
                </button>
              )}
            </div>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
              <div className={`${cardBg} p-6 rounded-xl shadow-xl max-w-md w-full mx-4`}>
                <h2 className={`text-xl font-bold mb-4 ${textColor}`}>Модальное окно</h2>
                <p className={`${mutedText} mb-4`}>Это модальное окно из Zustand</p>
                <button onClick={closeModal} className={`w-full ${primaryColor} ${primaryHover} text-white py-2 rounded-lg`}>Закрыть</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{mainContent}</>;
});

export default Task4;